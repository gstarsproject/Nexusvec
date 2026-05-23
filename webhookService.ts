import { SupplierStatus } from './types';

export interface WebhookPayload {
  supplier: string;
  externalOrderId: string;
  status: SupplierStatus;
  raw: any;
}

export class WebhookService {
  /**
   * Universal webhook entry point
   * Normalizes provider-specific payloads into standard NexusCore events
   */
  static async handleIncoming(payload: WebhookPayload) {
    console.log(`[Webhook] Received update from ${payload.supplier} for ${payload.externalOrderId}: ${payload.status}`);
    
    // 1. Locate Internal Order in DB
    // 2. Update status and log audit trail
    // 3. Trigger Real-time Event (Socket/Firebase)
    // 4. (Optional) Auto-refund if status is FAILED or CANCELLED
    
    return { 
      processed: true, 
      orderId: payload.externalOrderId,
      action: payload.status === SupplierStatus.FAILED ? 'REFUND_QUEUED' : 'STATUS_UPDATED'
    };
  }

  /**
   * Provider-specific parser: Digiflazz
   */
  static parseDigiflazz(body: any): WebhookPayload {
    // Digiflazz format: { data: { ref_id: "...", status: "...", rc: "..." } }
    const data = body.data || body;
    let status = SupplierStatus.PROCESSING;
    
    if (data.status === 'Sukses') status = SupplierStatus.COMPLETED;
    if (data.status === 'Gagal') status = SupplierStatus.FAILED;

    return {
      supplier: 'DIGIFLAZZ',
      externalOrderId: data.ref_id,
      status,
      raw: body
    };
  }
}
