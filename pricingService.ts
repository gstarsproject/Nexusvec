export type PricingRule = any;
export const pricingService = {
  getProductPricing: async (...args: any[]) => { return []; },
  updatePricing: async (...args: any[]) => { return true; },
  addRule: async (...args: any[]) => { return { id: 'mock' }; },
  deleteRule: async (...args: any[]) => { return true; },
  applyRule: async (...args: any[]) => { return true; },
  subscribeToRules: (...args: any[]) => { 
    if (typeof args[1] === 'function') args[1]([]); 
    return () => {}; 
  }
};
