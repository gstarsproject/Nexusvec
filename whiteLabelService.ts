import prisma from '../../lib/prisma';

export const whiteLabelService = {
  getConfig: async (tenantId: string) => {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { whiteLabelConfig: true }
    });
  },
  
  updateConfig: async (tenantId: string, data: any) => {
    return prisma.whiteLabelConfig.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data
    });
  },

  resolveByDomain: async (domain: string) => {
    return prisma.tenant.findFirst({
      where: { customDomain: domain },
      include: { whiteLabelConfig: true }
    });
  }
};
