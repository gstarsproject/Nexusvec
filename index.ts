export type Role =
  | 'SUPER_OWNER'
  | 'TENANT_OWNER'
  | 'ADMIN'
  | 'RESELLER'
  | 'MEMBER'
  | 'SUPPLIER'
  | 'CUSTOMER'
  | 'SUPER_ADMIN'
  | 'SUPER_ROOT'
  | 'OWNER'
  | 'FINANCE'
  | 'SUPPORT'
  | 'STAFF'
  | 'super_admin'
  | 'owner'
  | 'reseller'
  | 'finance'
  | 'support'
  | 'staff'
  | 'admin'
  | 'member'
  | 'supplier'
  | 'customer';

export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  siteTitle?: string;
  supportTelegram?: string;
  footerText?: string;
  theme: Theme;
  ownerId?: string;
  type?: 'SUPPLIER' | 'RESELLER';
  createdAt?: any;
  config?: {
    language?: string;
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
}

export interface User {
  uid: string;
  email: string | null;
  role: Role;
  agencyId: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt: any; // Firestore Timestamp
}

export interface Permissions {
  canEditCatalog: boolean;
  canViewProfits: boolean;
  canManageDomains: boolean;
  canViewFraud: boolean;
  canUseTerminal: boolean;
  canManageSuppliers: boolean;
  canViewGrowth: boolean;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  status: string;
}

export interface Category {
  id: string;
  agencyId: string;
  name: string;
  icon?: string;
  order: number;
  createdAt: any;
}

export interface Product {
  id: string; 
  agencyId: string;
  supplierId: string;
  supplierName: string;
  appName: string; // platform e.g. Instagram, TikTok
  category: string; // service type e.g. Followers, Likes
  basePrice: number;
  status: 'ACTIVE' | 'DISABLED'; // Supplier side status
  productCode: string; // External ID from supplier
  thumbnail?: string;
  syncedAt: any;
  isEnabled: boolean; // Agency side control for resellers
  description?: string;
  min?: number;
  max?: number;
  rate?: number; // Internal unit rate
  name: string; // Display name
  sellingPrice?: number;
  marginType?: 'PERCENTAGE' | 'FIXED';
  marginValue?: number;
  variants?: ProductVariant[];
}

export interface Order {
  id: string;
  resellerId?: string;
  agencyId?: string;
  productId?: string;
  supplierId?: string;
  externalOrderId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'ERROR' | 'SUCCESS' | 'FAILED';
  quantity?: number;
  totalCost?: number;
  targetUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  // Fields below were from mock, keeping for compatibility
  sku?: string;
  price?: string | number; // Support both
  time?: string;
  userId?: string;
  customerData?: string;
  profit?: number;
}

export interface Transaction {
  id: string;
  resellerId: string;
  agencyId: string;
  type: 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'FREEZE' | 'UNFREEZE' | 'CONFIRM_DEBIT';
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  paymentMethod?: string;
  orderId?: string;
  referenceId?: string;
  createdAt: any;
  updatedAt?: any;
  metadata?: Record<string, any>;
}

export interface SupplierConnection {
  id: string;
  agencyId: string;
  supplierName: string;
  apiKey: string;
  secretKey?: string;
  resellerId?: string;
  accessToken?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSyncAt: any;
  createdAt: any;
}

export interface SupplierHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Stable' | 'Maintenance';
  latency: number;
  load: number;
}

export interface Reseller {
  id: string;
  agencyId: string;
  parentId?: string; // ID of the parent reseller or agency
  hierarchyLevel?: number; // 0 for top-tier resellers
  path?: string; // materialized path for hierarchy queries
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  balance: number;
  pendingBalance: number;
  frozenBalance: number;
  tierId?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ResellerTier {
  id: string;
  agencyId: string;
  name: string;
  markupPercentage: number;
  description?: string;
  color?: string;
  minMonthlyVolume?: number;
  benefits?: string[];
  createdAt: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetRoles: Role[];
  createdAt: any;
  createdBy: string;
  expiresAt?: any;
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  content: string;
  createdAt: any;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'REPLIED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'BILLING' | 'ORDER' | 'TECHNICAL' | 'GENERAL';
  lastMessageAt: any;
  createdAt: any;
  orderId?: string;
  agencyId?: string;
}

export interface Tenant {
  id: string; // Primary Key
  ownerId: string; // Foreign Key to Users table
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  themeConfig: Record<string, any>;
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  subscriptionId?: string; // Foreign Key to Subscriptions
  settings: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

export interface Wallet {
  id: string; // Primary Key
  tenantId: string; // Foreign Key to Tenants
  userId: string; // Owner of the wallet (Reseller, Customer)
  balance: number;
  currency: string;
  frozenBalance: number;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: any;
  updatedAt: any;
}

export interface Commission {
  id: string;
  tenantId: string;
  transactionId: string; // Foreign Key to Transactions
  sourceUserId: string; // Who generated the commission
  recipientUserId: string; // Who receives the commission
  amount: number;
  type: 'MARKUP' | 'REFERRAL' | 'PLATFORM_FEE';
  status: 'PENDING' | 'CLEARED' | 'CANCELLED';
  createdAt: any;
}

export interface Webhook {
  id: string;
  tenantId: string;
  url: string;
  events: string[]; // e.g., ['order.success', 'wallet.funded']
  secret: string;
  isActive: boolean;
  retryCount: number;
  lastTriggeredAt?: any;
  createdAt: any;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
  payload: Record<string, any>;
  createdAt: any;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: 'SYSTEM' | 'ORDER' | 'WALLET' | 'SUPPORT';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: any;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string; // E.g., 'ENTERPRISE_YEARLY'
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodStart: any;
  currentPeriodEnd: any;
  cancelAtPeriodEnd: boolean;
  paymentMethodId?: string;
  createdAt: any;
}

export interface PayoutRequest {
  id: string;
  tenantId: string;
  userId: string; // Reseller requesting payout
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  bankDetails: Record<string, any>;
  processedAt?: any;
  createdAt: any;
}

export enum ProductCategory {
  MOBILE_LEGENDS = 'Mobile Legends',
  FREE_FIRE = 'Free Fire',
  VALORANT = 'Valorant',
  PUBG_MOBILE = 'PUBG Mobile',
  GENSHIN_IMPACT = 'Genshin Impact',
  STEAM_WALLET = 'Steam Wallet',
  GENERAL = 'General'
}

export enum SupplierProvider {
  DIGIFLAZZ = 'DIGIFLAZZ',
  API_GAMES = 'API_GAMES',
  UNIPIN = 'UNIPIN',
  INTERNAL = 'INTERNAL'
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  MAINTENANCE = 'MAINTENANCE'
}

export interface ProductPricing {
  productId: string;
  role: Role;
  markupType: 'PERCENTAGE' | 'FIXED';
  markupValue: number;
  calculatedPrice: number;
}

