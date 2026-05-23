import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from '../modules/audit/auditLogger';

export const auditMiddleware = (actionPrefix: string = 'API_REQUEST') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We capture the end of the request to log success or failure
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', () => {
      // Only log mutating actions or important reads
      if (req.method === 'GET' && actionPrefix !== 'API_SENSITIVE_READ') return;

      const tenantId = (req as any).tenantId || (req as any).agency?.id || 'system';
      const userId = (req as any).userId;
      const severity = res.statusCode >= 400 ? 'WARNING' : 'INFO';

      AuditLogger.log({
        tenantId,
        userId,
        action: `${actionPrefix}_${req.method}`,
        entityType: req.originalUrl,
        ipAddress: req.ip || req.socket.remoteAddress,
        severity,
        details: {
          statusCode: res.statusCode,
          query: req.query,
          // Exclude raw body if sensitive, but good for structure
          body: req.method !== 'GET' ? req.body : undefined
        }
      });
    });

    next();
  };
};
