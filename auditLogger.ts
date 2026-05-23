import prisma from '../../lib/prisma';

export interface AuditLogDto {
  tenantId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class AuditLogger {
  static async log(data: AuditLogDto) {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: data.tenantId,
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          details: data.details || {},
          ipAddress: data.ipAddress,
          severity: data.severity || 'INFO',
        }
      });
    } catch (error) {
      console.error('[AUDIT_LOGGER_ERROR]', error);
    }
  }
}
