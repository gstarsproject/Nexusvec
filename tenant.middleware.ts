import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host || "";
  let tenant = null;

  try {
    // Try custom domain lookup
    tenant = await prisma.tenant.findUnique({
      where: { customDomain: host },
      include: { whiteLabelConfig: true }
    });

    // Try subdomain lookup
    if (!tenant && host.includes("gstars.io")) {
      const subdomain = host.split(".")[0];
      tenant = await prisma.tenant.findUnique({
        where: { slug: subdomain },
        include: { whiteLabelConfig: true }
      });
    }

    // Fallback for default execution environment
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        include: { whiteLabelConfig: true }
      });
    }

    // Auto-seed default tenant if database has zero tenants
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          id: "nexus-core-prod",
          name: "NexusCore Global Store",
          slug: "nexus",
          email: "support@nexuscore.io",
          status: "ACTIVE",
          primaryColor: "#9333ea",
          whiteLabelConfig: {
            create: {
              siteTitle: "NexusCore Platform",
              isEnabled: true
            }
          }
        },
        include: { whiteLabelConfig: true }
      });
      console.log("Initialized default Tenant in Postgres!");
    }
  } catch (err: any) {
    console.error("Database unavailable in tenantMiddleware:", err);
    // Proceed without tenant context (or we can inject a mock tenant)
    tenant = {
      id: "nexus-core-prod",
      name: "NexusCore Offline Mode",
      status: "ACTIVE"
    } as any;
  }

  (req as any).tenant = tenant;
  (req as any).tenantId = tenant?.id;
  (req as any).agency = tenant;

  next();
};
