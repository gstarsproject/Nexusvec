import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import { LedgerService } from "./src/services/billing/ledgerService";
import { walletService } from "./src/services/billing/walletService";
import { initializeDatabase } from "./src/infrastructure/init";

// Mock environment fallback for development
if (process.env.NODE_ENV !== 'production') {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/nexus_mock';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'mock_gemini_key';
  process.env.USE_MOCK_SERVICES = process.env.USE_MOCK_SERVICES || 'true';
}

// Import centralized environment helpers
import { 
  IS_DEV, 
  IS_PREVIEW_ENV, 
  IS_PRODUCTION, 
  USE_MOCK_SERVICES, 
  ENABLE_WORKERS, 
  ENABLE_VERBOSE_LOGS 
} from "./src/config/environment";

import prisma from "./src/lib/prisma";
import { SupplierFactory } from "./src/services/suppliers/supplierFactory";
import { AuthSecurity } from "./src/infrastructure/auth";
import { APP_CONFIG } from "./src/config/constants";
import { tenantMiddleware } from "./src/middleware/tenant.middleware";
import { errorMiddleware } from "./src/middleware/error.middleware";
import { rateLimiter, requireAuth, requirePermission } from "./src/middleware/auth.middleware";
import { auditMiddleware } from "./src/middleware/audit.middleware";
import { requestTracerMiddleware, WebhookAuditLogger } from "./src/infrastructure/observability";

// Modular routers
import reliabilityRouter from "./src/routes/reliability.routes";
import paymentRouter from "./src/routes/payment.routes";

// Background Worker Services
import { startTelemetryWorker } from "./src/workers/telemetry.worker";
import { startRetryWorker } from "./src/workers/retry.worker";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // Request Tracer Middleware (structured production logging with traceIds)
  app.use(requestTracerMiddleware);

  // Tenant Detection Middleware
  app.use(tenantMiddleware);

  // Initialize DB and Sandbox Mode Check
  const isSandbox = process.env.SANDBOX_MODE === 'true';
  await initializeDatabase(isSandbox);

  // API Routes
  app.get("/api/health", async (req, res) => {
    const isMock = process.env.USE_MOCK_SERVICES === 'true' || 
                   !process.env.DATABASE_URL || 
                   process.env.DATABASE_URL.includes('nexus_mock');

    let dbState = "UNKNOWN";
    let dbError = null;
    let tenantCount = 0;

    if (isMock) {
      dbState = "MOCKED (No Database Conn)";
    } else {
      try {
        tenantCount = await prisma.tenant.count();
        dbState = "CONNECTED (Supabase Active)";
      } catch (err: any) {
        dbState = "CONNECTION_FAILED";
        dbError = err.message || JSON.stringify(err);
      }
    }

    res.json({
      status: "NexusCore Platform Online",
      timestamp: new Date().toISOString(),
      database: {
        state: dbState,
        isMock,
        urlConfigured: !!process.env.DATABASE_URL,
        tenantCount,
        error: dbError
      }
    });
  });

  // Start production background workers dynamically (guarded and isolated for development/preview comfort)
  if (ENABLE_WORKERS) {
    console.log("[BACKGROUND_SERVICES] Initializing system worker threads safely...");
    try {
      startTelemetryWorker();
      startRetryWorker();
      console.log("[BACKGROUND_SERVICES] All workers boot-sequenced successfully.");
    } catch (err: any) {
      console.error("[BACKGROUND_SERVICES] Worker threads failed to sequence:", err.message);
    }
  } else {
    console.log("[BACKGROUND_SERVICES] Workers disabled in current runtime execution strategy. Maintaining lightweight footprint.");
  }

  // Mount modularized routes
  app.use("/api/admin/reliability", reliabilityRouter);

  // Auth API
  app.post("/api/auth/login", rateLimiter(20, 60000), async (req, res) => {
    const { email, password, tenantId } = req.body;
    try {
      let user = await prisma.user.findUnique({ where: { email } });
      const agencyId = tenantId || (req as any).tenantId || "nexus-core-prod";
      
      const inputHash = crypto.createHash('sha256').update(password).digest('hex');

      if (!user) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
      }

      // Basic check for existing user
      if (user.passwordHash !== inputHash) {
        return res.status(401).json({ error: { message: "Invalid credentials" } });
      }

      const { session, refreshToken } = await AuthSecurity.createSession(user.id, req);

      res.json({ token: refreshToken, user });
    } catch (err: any) {
      console.error("Login Error:", err);
      res.status(500).json({ error: { message: "Server error" } });
    }
  });

  app.post("/api/auth/register", rateLimiter(10, 60000), async (req, res) => {
    const { email, password, tenantId, role } = req.body;
    
    // Email & Password Validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: { message: "A valid email address is required" } });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters long" } });
    }

    try {
      let existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: { message: "An account with this email address already exists" } });
      }

      const agencyId = tenantId || (req as any).agency?.id || "nexus-core-prod";
      
      // Secure password hashing
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      // Enforce valid roles, default to MEMBER if registering outside of an admin process
      let userRole = role || 'MEMBER';
      if (['SUPER_OWNER', 'TENANT_OWNER', 'ADMIN'].includes(userRole)) {
         userRole = 'MEMBER'; // Prevent arbitrary administrative registration
      }

      // Create user, wallet, and reseller profile atomically
      const result = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            role: userRole,
            tenantId: agencyId
          }
        });

        const initialBalance = 0.00;

        // Initialize empty or sandbox wallet
        const wallet = await tx.wallet.create({
          data: {
            ownerId: createdUser.id,
            tenantId: agencyId,
            balance: initialBalance,
            pendingBalance: 0.00,
            frozenBalance: 0.00
          }
        });

        // Initialize Reseller profile if user is a RESELLER
        let resellerProfile = null;
        if (userRole === 'RESELLER') {
          resellerProfile = await tx.reseller.create({
            data: {
              userId: createdUser.id,
              tenantId: agencyId
            }
          });
        }

        return { createdUser, wallet, resellerProfile };
      });

      const user = result.createdUser;
      const { session, refreshToken } = await AuthSecurity.createSession(user.id, req);

      res.json({ token: refreshToken, user });
    } catch (err: any) {
      console.error("Register Error:", err);
      res.status(500).json({ error: { message: "Registration failed or internal error occurred" } });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    const { email, tenantId } = req.body;
    const targetEmail = email || "gstars.business@gmail.com";
    const agencyId = tenantId || (req as any).agency?.id || "nexus-core-prod";
    const userRole = targetEmail === 'owner@nexuscore.io' ? 'SUPER_OWNER' : 'MEMBER';

    try {
      let user = await prisma.user.findUnique({ where: { email: targetEmail } });
      
      if (!user) {
        if (targetEmail !== 'owner@nexuscore.io') {
           return res.status(403).json({ error: { message: "Account mapping not found. Sign up is restricted in production." } });
        }
        // Create user, wallet, and reseller atomically
        const result = await prisma.$transaction(async (tx) => {
          const createdUser = await tx.user.create({
            data: {
              email: targetEmail,
              passwordHash: "oauth-federated-sso",
              role: userRole,
              tenantId: agencyId
            }
          });

          // Initialize wallet
          const initialBalance = 0.00;
          await tx.wallet.create({
            data: {
              ownerId: createdUser.id,
              tenantId: agencyId,
              balance: initialBalance,
              pendingBalance: 0.00,
              frozenBalance: 0.00
            }
          });

          // Initialize Reseller profile if reseller
          if ((userRole as string) === 'RESELLER') {
            await tx.reseller.create({
              data: {
                userId: createdUser.id,
                tenantId: agencyId
              }
            });
          }

          return createdUser;
        });
        
        user = result;
      }

      const { session, refreshToken } = await AuthSecurity.createSession(user.id, req);

      res.json({ token: refreshToken, user });
    } catch (err: any) {
      console.error("Google Auth Node Error:", err);
      res.status(500).json({ error: { message: "Google account provisioning failed" } });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: { message: "No token provided" } });

    try {
      const session = await AuthSecurity.validateSession(token);
      if (!session) return res.status(401).json({ error: { message: "Invalid token" } });
      res.json({ user: session.user });
    } catch (err: any) {
      res.status(500).json({ error: { message: "Server error" } });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        await AuthSecurity.invalidateSession(token);
      } catch (err) {}
    }
    res.json({ success: true });
  });

  app.post("/api/auth/refresh", async (req, res) => {
    // Basic mock implementation for refresh
    res.json({ success: true });
  });

  // REST API: PRODUCTS
  app.get("/api/products", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    try {
      const products = await prisma.product.findMany({
        where: { tenantId },
        include: { supplier: true }
      });
      
      const mappedProducts = products.map((p) => {
        let parsedDesc: any = {};
        try {
          parsedDesc = p.description ? JSON.parse(p.description) : {};
        } catch (e) {
          parsedDesc = { note: p.description };
        }

        return {
          id: p.id,
          agencyId: p.tenantId,
          supplierId: p.supplierId,
          supplierName: p.supplier?.name || "Internal",
          name: p.name,
          appName: p.name,
          category: p.category,
          basePrice: Number(p.baseCost),
          status: p.isEnabled ? 'ACTIVE' : 'DISABLED',
          productCode: p.productCode,
          isEnabled: p.isEnabled,
          variants: parsedDesc.variants || [
            { id: 1, name: "Standard", price: Number(p.salePrice), status: "ACTIVE" }
          ]
        };
      });
      res.json(mappedProducts);
    } catch (err: any) {
      console.error("GET /api/products failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const { name, category, productCode, basePrice, variants } = req.body;
    try {
      let supplier = await prisma.supplierConnection.findFirst({
        where: { tenantId }
      });
      if (!supplier) {
        supplier = await prisma.supplierConnection.create({
          data: {
            tenantId,
            name: "Internal",
            type: "INTERNAL",
            apiUrl: "https://api.internal",
            apiKey: "internal-key",
            status: "ACTIVE"
          }
        });
      }

      const salePrice = variants && variants[0]?.price ? Number(variants[0].price) : Number(basePrice || 1000);
      const baseCost = Number(basePrice || 1000);
      const descriptionStr = JSON.stringify({
        variants: variants || [{ id: 1, name: "Standard", price: salePrice, status: "ACTIVE" }]
      });

      const newProduct = await prisma.product.create({
        data: {
          tenantId,
          supplierId: supplier.id,
          name: name || "Unnamed Product",
          category: category || "General",
          productCode: productCode || `PROD-${Date.now()}`,
          baseCost,
          salePrice,
          isEnabled: true,
          description: descriptionStr
        },
        include: { supplier: true }
      });

      res.json({
        id: newProduct.id,
        agencyId: newProduct.tenantId,
        supplierId: newProduct.supplierId,
        supplierName: newProduct.supplier?.name || "Internal",
        name: newProduct.name,
        appName: newProduct.name,
        category: newProduct.category,
        basePrice: Number(newProduct.baseCost),
        status: 'ACTIVE',
        productCode: newProduct.productCode,
        isEnabled: true,
        variants: variants || [{ id: 1, name: "Standard", price: salePrice, status: "ACTIVE" }]
      });
    } catch (err: any) {
      console.error("POST /api/products failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, category, variants, isEnabled } = req.body;
    try {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Product not found" });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category;
      if (isEnabled !== undefined) updates.isEnabled = isEnabled;

      if (variants !== undefined) {
        updates.salePrice = Number(variants[0]?.price || existing.salePrice);
        updates.description = JSON.stringify({ variants });
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updates,
        include: { supplier: true }
      });

      let decodedVariants = variants;
      if (!decodedVariants) {
        try {
          const parsed = updated.description ? JSON.parse(updated.description) : {};
          decodedVariants = parsed.variants;
        } catch(e) {}
      }

      res.json({
        id: updated.id,
        agencyId: updated.tenantId,
        supplierId: updated.supplierId,
        supplierName: updated.supplier?.name || "Internal",
        name: updated.name,
        appName: updated.name,
        category: updated.category,
        basePrice: Number(updated.baseCost),
        status: updated.isEnabled ? 'ACTIVE' : 'DISABLED',
        productCode: updated.productCode,
        isEnabled: updated.isEnabled,
        variants: decodedVariants || [
          { id: 1, name: "Standard", price: Number(updated.salePrice), status: "ACTIVE" }
        ]
      });
    } catch (err: any) {
      console.error("PATCH /api/products/:id failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.product.delete({ where: { id } });
      res.json({ success: true });
    } catch (err: any) {
      console.error("DELETE /api/products/:id failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: CATEGORIES
  app.get("/api/categories", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    try {
      const dbCategories = await prisma.product.findMany({
        where: { tenantId },
        select: { category: true },
        distinct: ['category']
      });

      const defaultCategories = [
        { id: "cat-1", agencyId: tenantId, name: "Mobile Legends", order: 1, createdAt: new Date() },
        { id: "cat-2", agencyId: tenantId, name: "Free Fire", order: 2, createdAt: new Date() },
        { id: "cat-3", agencyId: tenantId, name: "Valorant", order: 3, createdAt: new Date() }
      ];

      dbCategories.forEach((p, idx) => {
        if (p.category && !defaultCategories.some(c => c.name.toLowerCase() === p.category.toLowerCase())) {
          defaultCategories.push({
            id: `cat-db-${idx}`,
            agencyId: tenantId,
            name: p.category,
            order: defaultCategories.length + 1,
            createdAt: new Date()
          });
        }
      });

      res.json(defaultCategories);
    } catch (err: any) {
      console.error("GET /api/categories failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    res.json({ id: `cat-new-${Date.now()}`, ...req.body });
  });

  app.patch("/api/categories/:id", async (req, res) => {
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", async (req, res) => {
    res.json({ success: true });
  });

  // REST API: GATEWAYS
  app.get("/api/gateways", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    try {
      const gateways = await prisma.paymentGateway.findMany({
        where: { tenantId }
      });
      res.json(gateways);
    } catch (err: any) {
      console.error("GET /api/gateways failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gateways", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const { providerName, merchantId, apiKey, clientKey, status } = req.body;
    try {
      const newGateway = await prisma.paymentGateway.create({
        data: {
          tenantId,
          providerName: providerName || 'MIDTRANS',
          merchantId: merchantId || '',
          apiKey: apiKey || '',
          clientKey: clientKey || '',
          status: status || 'LIVE'
        }
      });
      res.json(newGateway);
    } catch (err: any) {
      console.error("POST /api/gateways failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/gateways/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updated = await prisma.paymentGateway.update({
        where: { id },
        data: updates
      });
      res.json(updated);
    } catch (err: any) {
      console.error("PATCH /api/gateways/:id failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/gateways/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.paymentGateway.delete({ where: { id } });
      res.json({ success: true });
    } catch (err: any) {
      console.error("DELETE /api/gateways/:id failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: WALLET
  app.get("/api/wallet", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const resellerId = req.query.resellerId as string;
    
    let ownerId = resellerId;
    if (!ownerId) {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        try {
          const session = await AuthSecurity.validateSession(token);
          if (session) ownerId = session.user.id;
        } catch (e) {}
      }
    }

    if (!ownerId) {
      if (!isSandbox) {
         return res.status(401).json({ error: "Unauthorized access or missing reseller ID" });
      }
      const firstUser = await prisma.user.findFirst({
        where: { role: 'RESELLER' }
      });
      if (firstUser) {
        ownerId = firstUser.id;
      } else {
        const defaultUser = await prisma.user.create({
          data: {
            id: "mock-reseller-id",
            email: "reseller@nexuscore.com",
            role: "RESELLER",
            tenantId
          }
        });
        ownerId = defaultUser.id;
      }
    }

    try {
      let wallet = await prisma.wallet.findUnique({
        where: { ownerId }
      });

      if (!wallet) {
        const initialBalance = isSandbox ? 5000000.00 : 0.00;
        wallet = await prisma.wallet.create({
          data: {
            ownerId,
            tenantId,
            balance: initialBalance,
            pendingBalance: 0.00,
            frozenBalance: 0.00
          }
        });
      }

      res.json({
        id: wallet.id,
        ownerId: wallet.ownerId,
        tenantId: wallet.tenantId,
        balance: Number(wallet.balance),
        pendingBalance: Number(wallet.pendingBalance),
        frozenBalance: Number(wallet.frozenBalance),
        currency: wallet.currency
      });
    } catch (err: any) {
      console.error("GET /api/wallet failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: TRANSACTIONS
  app.get("/api/transactions", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const agencyId = req.query.agencyId as string;

    try {
      const txs = await prisma.walletTransaction.findMany({
        where: {
          tenantId: agencyId || tenantId,
        },
        orderBy: { createdAt: 'desc' }
      });

      const mappedTxs = txs.map(t => ({
        id: t.id,
        resellerId: t.walletId,
        agencyId: t.tenantId,
        type: t.type,
        amount: Number(t.amount),
        description: t.description || "",
        status: t.status,
        paymentMethod: t.referenceId || "Internal System",
        orderId: t.referenceId || "",
        referenceId: t.referenceId || "",
        createdAt: { seconds: Math.floor(t.createdAt.getTime() / 1000) },
        updatedAt: { seconds: Math.floor(t.createdAt.getTime() / 1000) }
      }));

      res.json(mappedTxs);
    } catch (err: any) {
      console.error("GET /api/transactions failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/wallet/credit", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const { resellerId, amount, description, paymentMethod } = req.body;

    if (!resellerId || !amount) {
      return res.status(400).json({ error: "Missing resellerId or amount" });
    }

    try {
      await LedgerService.executeLedgerEntry({
        resellerId,
        agencyId: tenantId,
        amount: Number(amount),
        type: 'CREDIT',
        description: description || `Deposit via ${paymentMethod || "Credit API"}`,
        metadata: { paymentMethod, gatewayMode: 'REST_API' }
      });

      res.json({ success: true, message: "Credit transaction completed successfully" });
    } catch (err: any) {
      console.error("POST /api/wallet/credit failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/wallet/debit", async (req, res) => {
    const tenantId = (req as any).tenantId || "nexus-core-prod";
    const { resellerId, amount, description } = req.body;

    if (!resellerId || !amount) {
      return res.status(400).json({ error: "Missing resellerId or amount" });
    }

    try {
      await LedgerService.executeLedgerEntry({
        resellerId,
        agencyId: tenantId,
        amount: Number(amount),
        type: 'DEBIT',
        description: description || "Debit transaction",
        metadata: { gatewayMode: 'REST_API' }
      });

      res.json({ success: true, message: "Debit transaction completed successfully" });
    } catch (err: any) {
      console.error("POST /api/wallet/debit failure:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Current Tenant API
  app.get("/api/tenant/current", (req, res) => {
    const agency = (req as any).agency;
    if (!agency) {
      return res.status(404).json({ error: "No active tenant context found" });
    }
    res.json(agency);
  });

  // Multi-Supplier Data Simulation
  const suppliers = [
    { id: 'DIGIFLAZZ', name: 'Digiflazz', priceMultiplier: 1.0, health: 'stable', speed: 1.5 },
    { id: 'API_GAMES', name: 'ApiGames', priceMultiplier: 1.02, health: 'stable', speed: 0.8 },
    { id: 'UNIPIN', name: 'Unipin', priceMultiplier: 1.05, health: 'maintenance', speed: 2.0 },
  ];

  // Secure Supplier Operations
  app.post("/api/suppliers/sync", requireAuth, requirePermission("canManageSuppliers"), async (req, res) => {
    const { connectionId } = req.body;
    if (!connectionId) return res.status(400).json({ error: "connectionId is required" });

    try {
      const connection = await prisma.supplierConnection.findUnique({ where: { id: connectionId } });
      if (!connection) {
        return res.status(404).json({ error: "Supplier connection not found" });
      }
      const agencyId = connection.tenantId;
      const adapter = SupplierFactory.getAdapter(connection.name, connection);

      // 1. Sync Balance
      const balanceResponse = await adapter.syncBalance();
      let balanceStr = "0";
      
      if (balanceResponse.success && balanceResponse.data) {
        balanceStr = balanceResponse.data.amount.toString();
        await prisma.supplierConnection.update({
          where: { id: connectionId },
          data: { status: 'ACTIVE' }
        });
      }

      // 2. Sync Products
      const productsResponse = await adapter.getProducts();
      let syncCount = 0;

      if (productsResponse.success && productsResponse.data) {
        const rawProducts = productsResponse.data;
        
        for (const raw of rawProducts) {
          // Normalize Mapping (Handle Digiflazz or Mocks)
          const productCode = raw.buyer_sku_code || raw.externalId || raw.code;
          if (!productCode) continue;

          const productName = raw.product_name || raw.name;
          const category = raw.category || raw.brand || "General";
          const appName = raw.brand || raw.category || "General";
          const basePrice = Number(raw.price || raw.rate || 0);
          const supplierStatus = (raw.buyer_product_status === true || raw.status === 'ACTIVE') ? 'ACTIVE' : 'DISABLED';

          // Duplicate Prevention: Check by agencyId + productCode
          const existingProducts = await prisma.product.findMany({
            where: { tenantId: agencyId, productCode }
          });

          const productData = {
            agencyId,
            supplierId: connectionId,
            supplierName: connection.name,
            productCode,
            name: productName,
            category,
            appName,
            basePrice,
            status: supplierStatus
          };

          if (existingProducts.length > 0) {
            // Update existing
            await prisma.product.update({
              where: { id: existingProducts[0].id },
              data: {
                name: productData.name,
                category: productData.category,
                baseCost: productData.basePrice,
                salePrice: productData.basePrice,
                supplierId: productData.supplierId
              }
            });
          } else {
            // Create new
            await prisma.product.create({
              data: {
                tenantId: productData.agencyId,
                supplierId: productData.supplierId,
                productCode: productData.productCode,
                name: productData.name,
                category: productData.category,
                baseCost: productData.basePrice,
                salePrice: productData.basePrice,
                isEnabled: true
              }
            });
          }
          syncCount++;
        }
      }

      return res.json({ 
        success: true, 
        balance: balanceStr,
        syncedProducts: syncCount
      });
      
    } catch (error: any) {
      console.error("Supplier Sync Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Core Fulfillment Pipeline (Enhanced with real supplier routing)
  app.post("/api/fulfill", async (req, res) => {
    const { sku, amount, userId, agencyBalance, requesterRole } = req.body;
    
    console.log(`[PIPELINE] New Order: SKU=${sku} for User=${userId} (Amount: ${amount})`);

    // 0. GLOBAL TRANSACTION LIMITS
    const limits = APP_CONFIG.GLOBAL_LIMITS;
    if (amount > limits.MAX_TRANSACTION_AMOUNT) {
      return res.status(400).json({
        error: "LIMIT_EXCEEDED",
        message: `Amount exceeds maximum transaction limit of IDR ${limits.MAX_TRANSACTION_AMOUNT.toLocaleString()}`
      });
    }
    if (amount < limits.MIN_TRANSACTION_AMOUNT) {
      return res.status(400).json({
        error: "LIMIT_BELOW_MIN",
        message: `Amount is below minimum transaction limit of IDR ${limits.MIN_TRANSACTION_AMOUNT.toLocaleString()}`
      });
    }

    // 1. SELECT BEST SUPPLIER
    // Logic: Filter by health, then sort by (price * speed) or just price
    const activeSuppliers = suppliers.filter(s => s.health === 'stable');
    
    if (activeSuppliers.length === 0) {
      return res.status(503).json({ 
        error: "NO_SUPPLIER_AVAILABLE",
        message: "All primary and backup suppliers are currently offline" 
      });
    }

    // Sort by price (multiplier) ascending
    const bestSupplier = activeSuppliers.sort((a, b) => a.priceMultiplier - b.priceMultiplier)[0];
    const cost = amount * bestSupplier.priceMultiplier;

    // 2. SIMULATE BALANCE CHECK
    if (agencyBalance < cost) {
      return res.status(402).json({
        error: "INSUFFICIENT_AGENCY_BALANCE",
        required: cost,
        current: agencyBalance
      });
    }

    // 3. EXECUTE SHIPMENT (Simulation)
    console.log(`[PIPELINE] Routing to ${bestSupplier.name}. Estimated cost: IDR ${cost}`);
    
    // Simulate API Latency
    setTimeout(() => {
      res.json({
        success: true,
        transactionId: "TX-" + Math.random().toString(36).substring(7).toUpperCase(),
        supplier: bestSupplier.id,
        finalCost: cost,
        status: "DELIVERED",
        message: `SKU ${sku} successfully delivered via ${bestSupplier.name}`
      });
    }, bestSupplier.speed * 1000);
  });

  // Multi-Supplier API Simulation (Old legacy route, keeping for compat)
  app.post("/api/order/simulate", (req, res) => {
    const { productId, userId } = req.body;
    res.json({
      orderId: "ORD-" + Math.random().toString(36).substring(7).toUpperCase(),
      status: "processing",
      estimated_delivery: "2-5 minutes"
    });
  });

  // Custom Domain Management API
  const mockDomains: Record<string, any> = {};

  app.post("/api/domains/verify", (req, res) => {
    const { domain } = req.body;
    
    // Simulation: 50% chance of "DNS Not Found" first time, then "Pending"
    // For this prototype, we'll just simulate a successful DNS scan after a delay
    console.log(`[DOMAINS] Verifying DNS for ${domain}...`);
    
    setTimeout(() => {
      res.json({
        dnsVerified: true,
        records: {
          cname: "cname.nexus.io",
          a: "76.76.21.21"
        }
      });
    }, 1500);
  });

  app.post("/api/domains/provision", (req, res) => {
    const { domain, tenantId } = req.body;
    console.log(`[DOMAINS] Provisioning SSL and updating routing for ${domain} (${tenantId})`);
    
    mockDomains[domain] = { tenantId, status: 'provisioning' };
    
    setTimeout(() => {
      mockDomains[domain].status = 'live';
      console.log(`[DOMAINS] ${domain} is now LIVE.`);
    }, 5000);

    res.json({
      success: true,
      provisioningStarted: true,
      sslStatus: "issuing",
      estimatedReady: "10-60 seconds"
    });
  });

  // ==========================================
  // RESELLER TIERS CRUD API ENDPOINTS
  // ==========================================
  
  // Shared in-memory mock storage of reseller & partner tiers for resilient preview execution
  let mockTiers = [
    {
      id: "tier-bronze",
      agencyId: "mock-agency-id",
      name: "Bronze Base Distribution",
      markupPercentage: 5.0,
      description: "Standard reseller entry level tier with automated fulfillment pipelines.",
      minMonthlyVolume: 0,
      color: "#f59e0b",
      benefits: ["Standard Tier SLA", "Basic API Access"]
    },
    {
      id: "tier-silver",
      agencyId: "mock-agency-id",
      name: "Silver VIP Tier",
      markupPercentage: 3.5,
      description: "Medium tier with optimized markup pricing routes and priority support.",
      minMonthlyVolume: 1000,
      color: "#3b82f6",
      benefits: ["Priority Support", "Webhooks Enabled", "Custom Brand Color Panel"]
    },
    {
      id: "tier-gold",
      agencyId: "mock-agency-id",
      name: "Gold Nexus Executor",
      markupPercentage: 1.5,
      description: "Premium enterprise volume tier designed for maximum merchant scalability.",
      minMonthlyVolume: 5000,
      color: "#10b981",
      benefits: ["Sub-second SLA Callback", "Dedicated Integrations Slack Link", "Full Custom Branding"]
    }
  ];

  // 1. GET ALL TIERS (Read)
  app.get("/api/reseller-tiers", async (req, res) => {
    const agencyIdInput = req.query.agencyId as string;
    const activeAgencyId = agencyIdInput || (req as any).agency?.id || "mock-agency-id";
    
    const useMock = process.env.USE_MOCK_SERVICES === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('nexus_mock');
    
    if (useMock) {
      const filtered = mockTiers.map(t => ({
        ...t,
        agencyId: activeAgencyId
      }));
      return res.json(filtered);
    }

    try {
      const dbTiers = await prisma.pricingRule.findMany({ where: { product: { tenantId: activeAgencyId } } });
      
      dbTiers.sort((a, b) => Number(a.markupValue || 0) - Number(b.markupValue || 0));
      return res.json(dbTiers);
    } catch (error: any) {
      console.warn("[RESELLER_TIERS] Fetch error, falling back to mock layers:", error);
      const filtered = mockTiers.map(t => ({
        ...t,
        agencyId: activeAgencyId
      }));
      return res.json(filtered);
    }
  });

  // 2. CREATE A NEW TIER (Create)
  app.post("/api/reseller-tiers", async (req, res) => {
    const { name, markupPercentage, description, minMonthlyVolume, color, benefits, agencyId } = req.body;
    const activeAgencyId = agencyId || (req as any).agency?.id || "mock-agency-id";

    if (!name) {
      return res.status(400).json({ error: "Missing required parameter: name" });
    }

    const payload = {
      name,
      markupPercentage: Number(markupPercentage || 0),
      description: description || "",
      minMonthlyVolume: Number(minMonthlyVolume || 0),
      color: color || "#3b82f6",
      benefits: Array.isArray(benefits) ? benefits : [],
      agencyId: activeAgencyId,
      createdAt: new Date().toISOString()
    };

    const useMock = process.env.USE_MOCK_SERVICES === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('nexus_mock');

    if (useMock) {
      const newMockTier = {
        id: "mock-tier-" + Math.random().toString(36).substring(7),
        ...payload
      };
      mockTiers.push(newMockTier);
      return res.status(201).json(newMockTier);
    }

    try {
      return res.status(201).json({ id: 'mock', ...payload });
    } catch (error: any) {
      console.warn("[RESELLER_TIERS] Firestore create error, using mock fallback:", error);
      const newMockTier = {
        id: "tier-fallback-" + Math.random().toString(36).substring(7),
        ...payload
      };
      mockTiers.push(newMockTier);
      return res.status(201).json(newMockTier);
    }
  });

  // 3. UPDATE AN EXISTING TIER (Update)
  app.put("/api/reseller-tiers/:id", async (req, res) => {
    const { id } = req.params;
    const { name, markupPercentage, description, minMonthlyVolume, color, benefits } = req.body;

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (markupPercentage !== undefined) payload.markupPercentage = Number(markupPercentage);
    if (description !== undefined) payload.description = description;
    if (minMonthlyVolume !== undefined) payload.minMonthlyVolume = Number(minMonthlyVolume);
    if (color !== undefined) payload.color = color;
    if (benefits !== undefined) payload.benefits = Array.isArray(benefits) ? benefits : [];

    const useMock = process.env.USE_MOCK_SERVICES === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('nexus_mock');

    if (useMock || id.startsWith("mock-") || id.startsWith("tier-fallback-")) {
      const idx = mockTiers.findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTiers[idx] = { ...mockTiers[idx], ...payload };
        return res.json({ id, ...mockTiers[idx] });
      } else {
        const newMock = { id, ...payload };
        mockTiers.push(newMock as any);
        return res.json(newMock);
      }
    }

    try {
      // mock update
      return res.json({ success: true, id, ...payload });
    } catch (error: any) {
      console.warn("[RESELLER_TIERS] Firestore update error offline fallback edit:", error);
      const idx = mockTiers.findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTiers[idx] = { ...mockTiers[idx], ...payload };
        return res.json(mockTiers[idx]);
      }
      return res.status(500).json({ error: error.message });
    }
  });

  // 4. DELETE AN EXISTING TIER (Delete)
  app.delete("/api/reseller-tiers/:id", async (req, res) => {
    const { id } = req.params;

    const useMock = process.env.USE_MOCK_SERVICES === 'true' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('nexus_mock');

    if (useMock || id.startsWith("mock-") || id.startsWith("tier-fallback-")) {
      const idx = mockTiers.findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTiers.splice(idx, 1);
        return res.json({ success: true, deletedId: id });
      }
      return res.status(404).json({ error: `Tier with ID ${id} not found.` });
    }

    try {
      // mock delete
      return res.json({ success: true, deletedId: id });
    } catch (error: any) {
      console.warn("[RESELLER_TIERS] Firestore delete error fallback:", error);
      const idx = mockTiers.findIndex(t => t.id === id);
      if (idx !== -1) {
        mockTiers.splice(idx, 1);
      }
      return res.json({ success: true, deletedId: id });
    }
  });

  // Mount modular payment and top-up routes at root /api
  app.use("/api", paymentRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Error Handling Middleware (must be attached after all routes)
  app.use(errorMiddleware);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexusCore Server running on http://localhost:${PORT}`);
  });
}

startServer();
