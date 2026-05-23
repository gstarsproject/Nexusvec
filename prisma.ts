import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ]
  });

  (client as any).$on?.('query', (e: any) => {
    try {
      // Lazy load to prevent circular dependencies in ESM loading
      const { logPrismaDiagnostics } = require('../infrastructure/observability');
      logPrismaDiagnostics(e.query, e.params, e.duration);
    } catch {
      // safe fallback
    }
  });

  return client;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Lazy initialization wrapper
const getInternalPrisma = () => {
  // Safe environment check for browser
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    return {} as any;
  }

  const isMock = process.env.USE_MOCK_SERVICES === 'true' || 
                 !process.env.DATABASE_URL || 
                 process.env.DATABASE_URL.includes('nexus_mock');

  if (isMock) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('NexusCore: Using mock database provider [Prisma Bypassed]');
    }
    return {} as any;
  }

  try {
    if (!globalThis.prisma) {
      globalThis.prisma = prismaClientSingleton();
    }
    return globalThis.prisma;
  } catch (err) {
    console.error('CRITICAL: Prisma Client failed to initialize:', err);
    // Return dummy to prevent immediate crash, let calling code handle the resulting undefined errors
    return {} as any;
  }
};

// Create a recursive proxy that returns dummy data or self to prevent crashes in mock mode
const createMockProxy = (path: string = 'prisma'): any => {
  const proxy: any = new Proxy(() => {}, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop !== 'then' && prop !== 'catch') {
        return createMockProxy(`${path}.${prop}`);
      }
      return undefined;
    },
    apply: (target, thisArg, args) => {
      console.warn(`[MOCK DB] Intercepted call to: ${path}(${args.map(a => JSON.stringify(a)).join(', ')})`);
      
      if (path.endsWith('$transaction')) {
        const callback = args[0];
        if (typeof callback === 'function') {
          return Promise.resolve(callback(proxy));
        }
      }
      
      if (path.endsWith('findMany')) {
        return Promise.resolve([]);
      }
      
      if (path.endsWith('count')) {
        return Promise.resolve(0);
      }

      // Return a robust mock row object for single-record operations (findUnique, findFirst, create, update, upsert)
      const isSingleFieldUserQuery = path.includes('user.findUnique') || path.includes('user.findFirst');
      if (isSingleFieldUserQuery) {
        return Promise.resolve(null);
      }

      const mockRow = {
        id: "mock-id-" + Math.floor(Math.random() * 100000),
        tenantId: "nexus-core-prod",
        userId: "mock-user-id",
        ownerId: "mock-user-id",
        balance: 5000000.00,
        pendingBalance: 0.00,
        frozenBalance: 0.00,
        passwordHash: "oauth-federated-sso",
        role: "RESELLER",
        email: "mock-dummy-user@nexuscore.com",
        name: "Mock Item",
        category: "Entertainment",
        productCode: "MOCK_CODE",
        isEnabled: true,
        baseCost: 10000.00,
        salePrice: 15000.00,
        supplierId: "mock-supplier-id",
        supplier: {
          id: "mock-supplier-id",
          name: "Mock Provider",
          type: "INTERNAL",
          apiUrl: "https://api.internal"
        },
        user: {
          id: "mock-user-id",
          email: "mock-dummy-user@nexuscore.com",
          role: "RESELLER",
          tenantId: "nexus-core-prod"
        }
      };

      return Promise.resolve(mockRow);
    }
  });
  return proxy;
};

// Export a proxy as the default object to maintain current API
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    if (typeof prop === 'symbol') return (target as any)[prop];
    
    const internal = getInternalPrisma();
    const value = internal[prop];
    
    // Safely check environment and mock flags without browser-crashing reference errors on process
    const isBrowser = typeof window !== 'undefined';
    const isMock = isBrowser || (
      typeof process !== 'undefined' && 
      process.env && (
        process.env.USE_MOCK_SERVICES === 'true' || 
        !process.env.DATABASE_URL || 
        process.env.DATABASE_URL.includes('nexus_mock')
      )
    );
    
    // If running in mock mode and property doesn't exist, return a recursive mock proxy
    if (value === undefined && isMock) {
      return createMockProxy(`prisma.${String(prop)}`);
    }
    
    return typeof value === 'function' ? value.bind(internal) : value;
  }
});

export default prisma;
