export interface IPaymentGateway {
  providerName: string;
  createInvoice(amount: number, metadata: any, customerDetails: any): Promise<{
    checkoutUrl: string;
    invoiceId: string;
  }>;
  checkStatus(invoiceId: string): Promise<{
    status: 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED';
    amountPaid?: number;
    paymentMethod?: string;
  }>;
}
