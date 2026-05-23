import { Request, Response, NextFunction } from 'express';
import { AuthSecurity } from '../infrastructure/auth';
import { PERMISSIONS } from '../config/constants';
import { Permissions, Role } from '../types';

// Simple High-Performance In-Memory Rate Limiter
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(limit: number, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitCache.get(key);
    if (!record || now > record.resetTime) {
      rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > limit) {
      console.warn(`[RATE_LIMITER] Blocked abusive request from client IP: ${ip} on path: ${req.path}`);
      return res.status(429).json({
        error: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please slow down and try again later.'
      });
    }

    next();
  };
}

// Authentication Verification & Multi-Tenant Isolation Protection
export function normalizeRole(role: string | null | undefined): Role {
  if (!role) return 'MEMBER';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN' || r === 'super_admin' || r === 'SUPER_OWNER' || r === 'SUPER_ROOT') return 'SUPER_OWNER';
  if (r === 'OWNER' || r === 'owner' || r === 'TENANT_OWNER') return 'TENANT_OWNER';
  if (r === 'ADMIN' || r === 'admin' || r === 'STAFF' || r === 'staff') return 'ADMIN';
  if (r === 'RESELLER' || r === 'reseller') return 'RESELLER';
  if (r === 'FINANCE' || r === 'finance') return 'FINANCE';
  if (r === 'SUPPORT' || r === 'support') return 'SUPPORT';
  if (r === 'MEMBER' || r === 'member' || r === 'CUSTOMER' || r === 'customer') return 'MEMBER';
  if (r === 'SUPPLIER' || r === 'supplier') return 'SUPPLIER';
  return role as Role; // fallback
}

// Reusable Role verification middleware
export function requireRole(allowedRoles: Role | Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawRole = (req as any).userRole || (req as any).user?.role;
    if (!rawRole) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active role found on session.'
      });
    }

    const currentRole = normalizeRole(rawRole);
    // SUPER_OWNER has absolute master bypass
    if (currentRole === 'SUPER_OWNER') {
      return next();
    }

    const rolesList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const normalizedAllowed = rolesList.map(r => normalizeRole(r));

    if (!normalizedAllowed.includes(currentRole)) {
      console.warn(`[RBAC_DENIED] Central Role guard rejected role [${currentRole}] (Expected: [${normalizedAllowed.join(', ')}])`);
      return res.status(403).json({
        error: 'FORBIDDEN_ROLE',
        message: 'Forbidden. You do not possess the required user roles/access level to perform this operation.'
      });
    }

    next();
  };
}

// Tenant validation middleware
export function requireTenantAccess() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const activeTenantId = (req as any).tenantId;

    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Session authentication required.'
      });
    }

    const userRole = normalizeRole(user.role);
    if (userRole === 'SUPER_OWNER') {
      return next(); // Super admin bypass
    }

    // Verify tenant match
    if (user.tenantId !== activeTenantId) {
      console.warn(`[TENANT_BREACH] User ${user.id} mismatch. Request tenant ${activeTenantId} vs user tenant ${user.tenantId}`);
      return res.status(403).json({
        error: 'FORBIDDEN_TENANT_ACCESS',
        message: 'Access denied. Security boundary breach detected.'
      });
    }

    next();
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Access denied. No active authorization header token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const session = await AuthSecurity.validateSession(token);
    if (!session) {
      return res.status(401).json({
        error: 'SESSION_EXPIRED',
        message: 'Your login session has expired or is invalid. Please log in again.'
      });
    }

    const userRole = normalizeRole(session.user.role);

    // Tenant Isolation Enforcement:
    // If the user's tenantId does not match the active tenant's context (attached via tenantMiddleware)
    // AND they are not a platform SUPER_ADMIN / SUPER_OWNER, deny access immediately to prevent cross-tenant data leaks.
    const activeTenantId = (req as any).tenantId;
    const isSuper = userRole === 'SUPER_OWNER';
    if (!isSuper && session.user.tenantId !== activeTenantId) {
      console.warn(`[TENANT_BREACH] User ${session.user.id} (${session.user.role}) of tenant ${session.user.tenantId} attempted cross-access of tenant ${activeTenantId}`);
      return res.status(403).json({
        error: 'FORBIDDEN_TENANT_ACCESS',
        message: 'Access denied. Security clearance mismatch with the current workspace tenant.'
      });
    }

    (req as any).user = {
      ...session.user,
      role: userRole
    };
    (req as any).userId = session.user.id;
    (req as any).userRole = userRole;

    next();
  } catch (err: any) {
    console.error('[AUTH_MIDDLEWARE] Error validating authorization token:', err);
    res.status(500).json({ error: 'INTERNAL_AUTH_ERROR', message: 'Failed to authenticate request.' });
  }
}

// Dynamic RBAC Permission Validation Middleware
export function requirePermission(permissionKey: keyof Permissions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole as Role;
    if (!userRole) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Access denied. Requester user role mapping is missing.'
      });
    }

    const canonicalRole = normalizeRole(userRole);
    if (canonicalRole === 'SUPER_OWNER') {
      return next(); // Super admin bypass
    }

    const rolePerms = PERMISSIONS[canonicalRole];
    const hasPermission = rolePerms && rolePerms[permissionKey] === true;

    if (!hasPermission) {
      console.warn(`[RBAC_DENIED] Requester role ${canonicalRole} denied access to missing permission: ${permissionKey}`);
      return res.status(403).json({
        error: 'FORBIDDEN_PRIVILEGE',
        message: `Security clearance privilege required: [${permissionKey}] is missing for user role [${userRole}].`
      });
    }

    next();
  };
}
