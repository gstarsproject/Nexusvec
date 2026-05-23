# NexusCore: Enterprise White-Label Coin Reseller System
## Technical Architecture & System Design Specification

**Role:** Senior SaaS Architect / Startup CTO  
**Project:** NexusCore Platform  
**Target:** High-Availability Digital Goods Reselling  

---

## 1. Technical Architecture: Modular Monolith to Microservices

For the initial growth phase (0 to 1), a **Modular Monolith** is our strategic choice. It avoids the "Distributed Monolith" anti-pattern and premature complexity while maintaining clear domain boundaries for a future shift to **Microservices**.

### Architectural Layers
1.  **Ingress Layer:** Nginx / Cloudflare for SSL Termination, WAF, and CNAME Routing.
2.  **API Gateway:** Node.js Express acting as a facade, handling Rate Limiting, Tenant Identification, and Auth.
3.  **Domain Services:**
    *   **Identity Service:** Auth, RBAC, Tenant isolation.
    *   **Wallet Service:** Ledger-based financial operations (The "Bank").
    *   **Supplier Bridge:** Adapters for Digiflazz, API Games, VIP, etc.
    *   **Product Catalog:** Multi-tenant product management.
4.  **Data Persistence:** Hybrid Multi-DB strategy.

### Database Technology Choice: Hybrid Strategy
*   **PostgreSQL (Primary):** Used for **Transactions, Wallets, and Hierarchy**.
    *   *Rationale:* Atomic transactions (ACID) are non-negotiable for financial systems. We use Row-Level Security (RLS) for tenant isolation.
*   **Firestore (Secondary):** Used for **Real-time Catalog & Sync Logs**.
    *   *Rationale:* Excellent for handling semi-structured product data from diverse suppliers and providing real-time UI updates for order statuses without long-polling.
*   **Redis (Cache):** Used for **Pricing Calculations & Tenant Config**.
    *   *Rationale:* Calculating complex multi-level pricing on every request is expensive. Redis stores the "Calculated Price Tree."

---

## 2. White-Label & Pricing Engine Implementation

### White-Label Logic
1.  **Subdomain/Domain Mapping:**
    *   The `TenantMiddleware` extracts the `Host` header.
    *   It checks the `Agencies` table for either a `slug` (subdomain) or `custom_domain`.
    *   Mapping is cached in Redis: `tenant_id:{host}`.
2.  **Branding Injection:**
    *   Client-side receives a `config` object on initial load: colors, logo, fonts, SEO metadata.
    *   Tailwind CSS variables are injected into the `:root` dynamically.

### Pricing Engine: Hierarchical Markup Logic
We implement a **Top-Down Cumulative Markup** system:
*   **Base Cost:** What the Supplier charges the Platform ($10.00).
*   **Agency Tier:** The Platform adds its commission (e.g., +1%).
*   **Agency Markup:** The Agency adds their global margin (e.g., +5%).
*   **Reseller Ranking:** Discounts or extra markups based on Reseller level (Gold/Platinum).

**Formula:**  
`ResellerPrice = (BaseCost * (1 + AgencyMarkup%)) - (ResellerRankDiscount)`

---

## 3. Security & Scaling Strategy

### Security Strategy
1.  **Ledger Integrity (Anti-Fraud):**
    *   We never just `UPDATE balanceSET balance = balance + X`.
    *   We use a **Double-Entry Ledger**. Total Balance = Sum of Transactions. This provides an immutable audit trail.
    *   **Pessimistic Locking:** `SELECT ... FOR UPDATE` in Postgres during balance deduction to prevent race conditions.
2.  **HMAC-Signed Webhooks:** All supplier callbacks are verified with a private signature to prevent injection of fake "Success" statuses.
3.  **Data at Rest:** AES-256 for encrypted Supplier API keys.

### Scaling Strategy
1.  **Horizontal Pod Autoscaling (HPA):** Deploy on Kubernetes (GKE/EKS). Scale the API Gateway based on CPU/Request count.
2.  **Write-Ahead Logging / Sidecars:** Offload supplier API calls to a **Message Queue (BullMQ / RabbitMQ)**. This ensures that even if a supplier is slow, our main thread stays responsive.
3.  **Read Replicas:** High-traffic storefronts read from PostgreSQL replicas, while the admin dashboard writes to the Primary.
4.  **Database Partitioning:** As the `Transactions` table hits millions of rows, we partition it by `agencyId` or `month`.

---

## 4. Proposed Database Schema (Prisma Format)

```prisma
// Example Core Models
model Agency {
  id           String   @id
  name         String
  customDomain String?  @unique
  themeConfig  Json     // { primary: "#hex", logo: "url" }
  wallets      Wallet[]
  products     Product[]
}

model Wallet {
  id       String    @id
  ownerId  String    // Agency or Reseller
  balance  Decimal   @db.Decimal(20, 2)
  ledger   Ledger[]
}

model Ledger {
  id        String   @id
  walletId  String
  amount    Decimal
  type      String   // CREDIT / DEBIT
  source    String   // ORDER / TOPUP / REFUND
  createdAt DateTime @default(now())
}
```

---

## 5. Multi-Tenant Role-Based Access Control (RBAC) & Permission Architecture

NexusCore implements a high-integrity, multi-tenant Role-Based Access Control system. It isolates data vertically by Tenant (Agency CNAME/Subdomain isolation) and horizontally by user roles. Database Row-Level Security (RLS) policies prevent cross-tenant data leaks, while the application routes enforce strict middleware guards for specific API access.

### 5.1 Role Definitions & Structural Mapping
* **Platform Owner (Super Admin):** The root controller overseeing the entire SaaS cluster infrastructure. They operate at the system-wide level.
* **Agency (Branded Tenant Owner):** The white-label operator managing their specific isolated tenant ecosystem. They control branding, pricing, margin exceptions, and their direct reseller network.
* **Reseller (Tiered Distributor):** Wholesalers acting as intermediaries. They purchase from the Agency at tiered baseline pricing to resell to end consumers or integrate downline software pipelines.
* **Customer (End-User Consumer):** Individual retail shoppers who access the store browser interface to place fast digital goods transactions.
* **Supplier System (Virtual Automation):** Programmatic system integrations representing raw fulfillment vendor APIs (e.g., Digiflazz, API Games), pushing live order webhook callbacks and pricing catalogues.

---

### 5.2 CRUD Permissions Reference Matrix

The table below outlines granular CRUD actions across core business domains:

| Module Domain & Context | Platform Owner (Super Admin) | Agency Owner (Tenant Admin) | Reseller (Tiered Wholesaler) | End-Customer (Retail) | Supplier System |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tenants & Core Domains** | **Full CRUD** (Provision, suspend, edit domains globally) | **Read-Write** (Manage own domain CNAME, branding tags) | *No Access* | *No Access* | *No Access* |
| **Wallets & Financial Ledger** | **Full CRUD** (Issue global credit/debit adjustments, full auditing) | **Tenant CRUD** (Adjust downstream reseller credit, log entries) | **Read-Only** (View own balance / ledger transactions) | **Read-Only** (View checkout pricing details) | *No Access* (Balance verified via credentials) |
| **Suppliers & API Adapters**| **Full CRUD** (Register, suspend, edit master secret keys) | **Read-Only** (View latency stats, select preferred supplier) | *No Access* | *No Access* | **Write-Only** (Post status updates, pull credential validations) |
| **Product SKUs & Markups** | **Master CRUD** (Set default MSRP formulas, system-wide base costs) | **Tenant CRUD** (Set custom markup margins, SKU exceptions) | **Read-Only** (View catalog matched with tier discounts) | **Read-Only** (View public storefront catalog) | **Read-Write** (Sync base catalog SKU pricing feeds) |
| **Orders & Fulfillment** | **Full CRUD** (Re-route, re-dispatch, manual override statuses) | **Tenant CRUD** (Monitor all tenant transactions, cancel/refund) | **Read-Write** (Initiate bulk orders, track order updates) | **Read-Write** (Submit retail topup, track transaction statuses) | **Read-Write** (Process API requests, post back order SN logs) |
| **Telemetry & Audit Logs**  | **Full CRUD** (Access global security logs, rate-limit logs) | **Tenant Read** (Access tenant activity and error queues) | *No Access* | *No Access* | **Write-Only** (Post api diagnostic/connection updates) |

---

### 5.3 Granular Access Architecture & Guardrails

#### 1. Platform Owner (Super Admin)
* **Access Scope:** Broad global cluster access across all tenant databases.
* **Permitted Actions:**
  * Provision new white-label tenant instances.
  * Audit ledger balances, adjust global platform rates, and suspend delinquent agencies.
  * Register, audit security configurations, and toggle programmatic circuit breakers on upstream supplier components.
  * Investigate centralized system exception logs, security audit files, and high-severity network latency telemetry.

#### 2. Agency (Branded Tenant Owner)
* **Access Scope:** Tenant-isolated data rows matching their active `tenantId`.
* **Permitted Actions:**
  * Customize client UI branding: customize styles, logo resources, navigation menus, and CNAME setups.
  * Set up tiered margins (Standard, Bronze, Silver, Gold, Platinum) and define pricing overrides per catalog category.
  * Maintain client databases: approve new resellers, review transaction history, edit balances, and manage support tickets.
  * Toggle supplier source preferences (e.g., route Steam vouchers through primary, Mobile Legends through fallback suppliers).

#### 3. Reseller (Tiered Distributor)
* **Access Scope:** Self-owned account data and downstream customer transactional logs.
* **Permitted Actions:**
  * Access custom catalogs displaying computed discount levels based on their active agency rank tier.
  * Perform fast transactions, track ledger logs, and manage account wallet levels.
  * Provision customized access keys for their downstream resellers to integrate core API routes programmatically.
  * Upload payment top-up receipts for automated agency admin verification.

#### 4. Customer (End-User Consumer)
* **Access Scope:** Session-based transactional cookies and specific order IDs.
* **Permitted Actions:**
  * Access the standard client-facing web catalog displaying public MSRP prices.
  * Execute high-speed checkouts using preferred integration payment gateways (e.g., USDT, local bank bank transfers).
  * Check transactional tracking statuses and download invoice files using security access tokens.

#### 5. Supplier System (Virtual Automation)
* **Access Scope:** Standardized programmatic API requests authenticated via HMAC keys.
* **Permitted Actions:**
  * Push webhook callback updates to the incoming endpoint indicating transaction success or failures.
  * Push catalog pricing updates dynamically, modifying catalog base cost calculations on-the-fly.
  * Respond programmatically to balance verification requests from the platform core orchestration server.

