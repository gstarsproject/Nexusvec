export const orderService = {
  createOrder: async (...args: any[]) => { return { id: 'mock' }; },
  processOrder: async (...args: any[]) => { return true; },
  updateOrderStatus: async (...args: any[]) => { return true; },
  getOrdersByReseller: async (...args: any[]) => { return []; },
  getPendingOrders: async (...args: any[]) => { return []; },
  getOrders: async (...args: any[]) => { return []; },
  placeOrder: async (...args: any[]) => { return { id: 'mock' }; },
  subscribeToOrders: (...args: any[]) => { 
    if (typeof args[1] === 'function') args[1]([]); 
    return () => {}; 
  }
};
