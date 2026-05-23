export interface PaymentGatewayConfig {
  id?: string;
  agencyId: string;
  providerName: 'MIDTRANS' | 'XENDIT' | 'STRIPE' | 'QRIS' | string;
  merchantId: string;
  apiKey: string;
  clientKey?: string;
  status: 'LIVE' | 'SANDBOX' | 'DISABLED';
  createdAt?: any;
  updatedAt?: any;
}

export const gatewayService = {
  async getGateways(agencyId: string): Promise<PaymentGatewayConfig[]> {
    try {
      const res = await fetch(`/api/gateways?agencyId=${agencyId}`);
      if (!res.ok) throw new Error("Failed to fetch gateways");
      
      const results = await res.json();
      if (results.length === 0) {
        return [
          {
            id: 'midtrans-default',
            agencyId,
            providerName: 'MIDTRANS',
            merchantId: 'YOUR_MERCHANT_ID',
            apiKey: 'YOUR_MIDTRANS_API_KEY',
            clientKey: 'YOUR_MIDTRANS_CLIENT_KEY',
            status: 'SANDBOX'
          }
        ];
      }
      return results;
    } catch (error) {
      console.warn('API fetch failed for gateways, reverting to local fallback:', error);
      return [
        {
          id: 'midtrans-default',
          agencyId,
          providerName: 'MIDTRANS',
          merchantId: 'YOUR_MERCHANT_ID',
          apiKey: 'YOUR_MIDTRANS_API_KEY',
          clientKey: 'YOUR_MIDTRANS_CLIENT_KEY',
          status: 'SANDBOX'
        }
      ];
    }
  },

  async addGateway(agencyId: string, data: Partial<PaymentGatewayConfig>): Promise<string> {
    const res = await fetch('/api/gateways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agencyId, ...data })
    });
    if (!res.ok) throw new Error("Failed to create gateway");
    const doc = await res.json();
    return doc.id;
  },

  async updateGateway(id: string, data: Partial<PaymentGatewayConfig>): Promise<void> {
    const res = await fetch(`/api/gateways/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update gateway");
  },

  async deleteGateway(id: string): Promise<void> {
    const res = await fetch(`/api/gateways/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete gateway");
  }
};
