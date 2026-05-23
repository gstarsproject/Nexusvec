import { ISupplierAdapter, SupplierValidationResult } from '../ISupplierAdapter';
import { SupplierConnection } from '../../../types/index';
import CryptoJS from 'crypto-js';

export class DigiflazzAdapter implements ISupplierAdapter {
  id = 'digiflazz';
  name = 'Digiflazz';

  private baseUrl = 'https://api.digiflazz.com/v1';

  async validateCredentials(credentials: Partial<SupplierConnection>): Promise<SupplierValidationResult> {
    const { resellerId, apiKey } = credentials;

    if (!resellerId || !apiKey) {
      return { isValid: false, message: 'Username (Reseller ID) and API Key are required.' };
    }

    try {
      const sign = CryptoJS.MD5(resellerId + apiKey + 'depo').toString();
      const response = await fetch(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resellerId,
          sign: sign
        })
      });

      const result = await response.json();
      
      if (result.data && result.data.rc === '00') {
        return {
          isValid: true,
          message: 'Connection established successfully.',
          metadata: { balance: result.data.deposit }
        };
      }

      return {
        isValid: false,
        message: result.data?.message || 'Failed to authenticate with Digiflazz.'
      };
    } catch (error) {
      console.error('Digiflazz validation error:', error);
      return { isValid: false, message: 'Network error connecting to Digiflazz.' };
    }
  }

  async syncData(connection: SupplierConnection): Promise<{ success: boolean; message: string; count?: number }> {
    const contextTag = `[Digiflazz Sync]`;
    console.log(`${contextTag} Initiating synchronization sequence for node reseller: "${connection.resellerId}"...`);

    if (!connection.resellerId || !connection.apiKey) {
      const errorMsg = 'Synchronization aborted: Credentials incomplete. Username (Reseller ID) and API Key are required.';
      console.error(`${contextTag} Error: ${errorMsg}`);
      return { success: false, message: errorMsg };
    }

    try {
      // Fetch product lists from Digiflazz
      console.log(`${contextTag} Retrieving updated pricelist from API...`);
      const products = await this.getProducts(connection);

      // Validate products format
      if (!products || !Array.isArray(products)) {
        const errorMsg = 'Invalid data structure received: Expected product list array but obtained null/invalid schema.';
        console.error(`${contextTag} Error: ${errorMsg}`);
        return { success: false, message: errorMsg };
      }

      if (products.length === 0) {
        const warnMsg = 'Sync finished: Active product pool is empty. Please verify your Digiflazz whitelist or account balance.';
        console.warn(`${contextTag} Warning: ${warnMsg}`);
        return { success: true, message: warnMsg, count: 0 };
      }

      // Return successful synchronization details
      const successMsg = `Successfully verified and synchronized ${products.length} catalog items from Digiflazz.`;
      console.log(`${contextTag} Success: ${successMsg}`);
      return {
        success: true,
        message: successMsg,
        count: products.length
      };

    } catch (error: any) {
      let failureReason = 'Internal sync execution failure.';
      
      // Categorize the thrown error to construct an informative error summary
      if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
        failureReason = 'Network connectivity failure: Unable to establish handshake with Digiflazz edge servers. Ensure firewall rules and DNS configurations are correct.';
      } else if (error instanceof SyntaxError) {
        failureReason = 'API protocol mismatch: Digiflazz endpoint returned non-JSON/invalid responses.';
      } else if (error.message) {
        failureReason = `Supplier API returned error: ${error.message}`;
      }

      const informativeMsg = `Sync Aborted: ${failureReason}`;
      console.error(`${contextTag} Critical Failure: ${informativeMsg}`, error);

      return {
        success: false,
        message: informativeMsg
      };
    }
  }

  async getProducts(connection: SupplierConnection): Promise<any[]> {
    const { resellerId, apiKey } = connection;
    const sign = CryptoJS.MD5(resellerId + apiKey + 'pricelist').toString();

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'prepaid',
          username: resellerId,
          sign: sign
        })
      });
    } catch (netError: any) {
      // Re-throw descriptive network error to be caught by syncData
      throw new TypeError(`Network issue during fetch: ${netError.message}`);
    }

    if (!response.ok) {
      throw new Error(`Endpoint returned HTTP Status ${response.status} (${response.statusText})`);
    }

    let result: any;
    try {
      result = await response.json();
    } catch (parseError: any) {
      throw new SyntaxError(`Malformed JSON payload: ${parseError.message}`);
    }

    // Handle Digiflazz operational errors wrapped inside non-00 rc inside result.data
    if (result.data) {
      if (Array.isArray(result.data)) {
        return result.data.map((item: any) => ({
          externalId: item.buyer_sku_code,
          name: item.product_name,
          category: item.category,
          type: item.brand,
          rate: item.price,
          min: 1,
          max: 1,
          description: `${item.desc || ''} | Status: ${item.seller_name || 'N/A'}`,
          status: item.buyer_product_status && item.unlimited_stock ? 'ACTIVE' : 'DISABLED'
        }));
      } else if (result.data.message) {
        // Digiflazz format for failures wraps an object containing the error message
        throw new Error(result.data.message);
      } else if (result.data.rc && result.data.rc !== '00') {
         throw new Error(`Operation failed with response code [${result.data.rc}]`);
      }
    }

    // In case result wrapper is valid but data is totally absent/corrupted
    throw new Error('Response validation failed: Missing "data" envelope in response.');
  }

  async placeOrder(connection: SupplierConnection, product: any, quantity: number, targetUrl: string): Promise<{ externalOrderId: string }> {
    const { resellerId, apiKey } = connection;
    const refId = `ORD-${Date.now()}`;
    const sign = CryptoJS.MD5(resellerId + apiKey + refId).toString();

    try {
      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resellerId,
          buyer_sku_code: product.externalId,
          customer_no: targetUrl,
          ref_id: refId,
          sign: sign
        })
      });

      const result = await response.json();

      if (result.data && (result.data.rc === '00' || result.data.rc === '03')) {
        return {
          externalOrderId: result.data.ref_id
        };
      }

      throw new Error(result.data?.message || 'Digiflazz order failed');
    } catch (error) {
       console.error('Digiflazz order error:', error);
       throw error;
    }
  }
}
