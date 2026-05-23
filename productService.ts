import { Product, Category } from '../../types';

export const productService = {
  getProducts: async (agencyId: string): Promise<Product[]> => {
    try {
      const res = await fetch(`/api/products?agencyId=${agencyId}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    } catch (err) {
      console.error("productsService.getProducts error:", err);
      return [];
    }
  },

  syncProducts: async (connection: any) => {
    try {
      const res = await fetch('/api/suppliers/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: connection?.id })
      });
      return res.ok;
    } catch (err) {
      console.error("productsService.syncProducts error:", err);
      return false;
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (err) {
      console.error("productsService.updateProduct error:", err);
      return false;
    }
  },

  addProduct: async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error("Failed to add product");
      return await res.json();
    } catch (err) {
      console.error("productsService.addProduct error:", err);
      return { id: 'error' };
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error("productsService.deleteProduct error:", err);
      return false;
    }
  },

  toggleProductStatus: async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled })
      });
      return res.ok;
    } catch (err) {
      console.error("productsService.toggleProductStatus error:", err);
      return false;
    }
  },

  subscribeToProducts: (agencyId: string, callback: (products: Product[]) => void) => {
    let active = true;
    const fetchProds = async () => {
      try {
        const res = await fetch(`/api/products?agencyId=${agencyId}`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error("productsService.subscribeToProducts poll failure:", err);
      }
    };
    fetchProds();
    const pollInterval = (import.meta as any).env?.DEV ? 30000 : 10000;
    const interval = setInterval(fetchProds, pollInterval);
    return () => {
      active = false;
      clearInterval(interval);
    };
  },

  // Categories
  subscribeToCategories(agencyId: string, callback: (categories: Category[]) => void) {
    let active = true;
    const fetchCats = async () => {
      try {
        const res = await fetch(`/api/categories?agencyId=${agencyId}`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error("subscribeToCategories poll failed:", err);
      }
    };

    fetchCats();
    const pollInterval = (import.meta as any).env?.DEV ? 30000 : 10000;
    const interval = setInterval(fetchCats, pollInterval);

    return () => {
      active = false;
      clearInterval(interval);
    };
  },

  async getCategories(agencyId: string): Promise<Category[]> {
    try {
      const res = await fetch(`/api/categories?agencyId=${agencyId}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    } catch (error) {
      console.error("getCategories error:", error);
      return [];
    }
  },

  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
      });
      if (!res.ok) throw new Error("Failed to create category");
      const saved = await res.json();
      return saved.id;
    } catch (error) {
      console.error("addCategory error:", error);
      return '';
    }
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<void> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update category");
    } catch (error) {
      console.error("updateCategory error:", error);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete category");
    } catch (error) {
      console.error("deleteCategory error:", error);
    }
  }
};

