import prisma from '../lib/prisma';
import crypto from 'crypto';

export class AuthSecurity {
  static async createSession(userId: string, req: any) {
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    
    // Set expiry to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken,
        ipAddress,
        deviceInfo,
        expiresAt
      }
    });

    return { session, refreshToken };
  }

  static async invalidateSession(refreshToken: string) {
    await prisma.session.delete({
      where: { refreshToken }
    });
  }

  static async validateSession(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.invalidateSession(refreshToken);
      }
      return null;
    }

    return session;
  }
}
