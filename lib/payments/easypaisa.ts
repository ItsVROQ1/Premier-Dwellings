import crypto from 'crypto';
import { PaymentRequest, PaymentResponse } from './types';

export class EasypaisaPaymentService {
  private merchantId: string;
  private password: string;
  private returnUrl: string;
  private apiUrl = 'https://sandbox.easypaisa.com.pk/api/payment/v2/create';

  constructor() {
    this.merchantId = process.env.EASYPAISA_MERCHANT_ID || '';
    this.password = process.env.EASYPAISA_PASSWORD || '';
    this.returnUrl = process.env.EASYPAISA_RETURN_URL || '';
  }

  /**
   * Generate secure hash for Easypaisa request
   */
  private generateHash(params: Record<string, string>): string {
    // Easypaisa uses SHA256 hash of sorted parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return crypto
      .createHash('sha256')
      .update(sortedParams + this.password)
      .digest('hex');
  }

  /**
   * Create payment request and return redirect URL
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = `${request.userId}_${Date.now()}`;
      const amount = Math.round(request.amount).toString();

      const params: Record<string, string> = {
        storeId: this.merchantId,
        authToken: this.password,
        transactionId,
        transactionAmount: amount,
        transactionDescription: request.description,
        customerEmail: request.metadata?.email || '',
        customerPhoneNumber: request.metadata?.phone || '',
        customerName: request.metadata?.name || 'Customer',
        returnUrl: this.returnUrl,
        notificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/easypaisa/webhook`,
      };

      const hash = this.generateHash(params);

      // Build form data for redirect
      const formData = new URLSearchParams({
        ...params,
        checksum: hash,
      }).toString();

      return {
        success: true,
        transactionId,
        status: 'PENDING',
        redirectUrl: `${this.apiUrl}?${formData}`,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Payment creation failed',
      };
    }
  }

  /**
   * Verify webhook signature and payment status
   */
  verifyWebhook(data: Record<string, string>): boolean {
    try {
      const checksum = data.checksum;
      const hashParams = { ...data };
      delete hashParams.checksum;

      const calculatedHash = this.generateHash(hashParams);
      return calculatedHash === checksum;
    } catch (error) {
      return false;
    }
  }

  /**
   * Process webhook and return payment status
   */
  processWebhook(data: Record<string, string>) {
    const verified = this.verifyWebhook(data);

    return {
      verified,
      transactionId: data.transactionId,
      status: data.transactionStatus === 'SUCCESS' ? 'COMPLETED' : 'FAILED',
      amount: data.transactionAmount,
    };
  }
}

export const easypaisaService = new EasypaisaPaymentService();
