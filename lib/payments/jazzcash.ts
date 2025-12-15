import crypto from 'crypto';
import { PaymentRequest, PaymentResponse, JazzCashRequest, PaymentGateway } from './types';

export class JazzCashPaymentService {
  private merchantId: string;
  private password: string;
  private returnUrl: string;
  private apiUrl = 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase'; // Use sandbox for testing

  constructor() {
    this.merchantId = process.env.JAZZCASH_MERCHANT_ID || '';
    this.password = process.env.JAZZCASH_PASSWORD || '';
    this.returnUrl = process.env.JAZZCASH_RETURN_URL || '';
  }

  /**
   * Generate secure hash for JazzCash request
   */
  private generateHash(params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => params[key])
      .join('&');

    const password = this.password + '&';
    const payload = password + sortedParams + '&' + this.password;

    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Create payment request and return redirect URL
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const merchantRef = `${request.userId}_${Date.now()}`;
      const amount = Math.round(request.amount * 100).toString(); // Convert to smallest unit

      const params: Record<string, string> = {
        pp_merchant_id: this.merchantId,
        pp_password: this.password,
        pp_version: '1.1',
        pp_txn_type: 'MWALLET',
        pp_language: 'en',
        pp_merchant_ref: merchantRef,
        pp_amount: amount,
        pp_bill_reference: request.invoiceNumber || merchantRef,
        pp_description: request.description,
        pp_notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/jazzcash/webhook`,
        pp_return_url: this.returnUrl,
        pp_irn: this.generateRandomString(16),
      };

      const hash = this.generateHash(params);

      // In production, you would redirect to JazzCash payment page
      // For testing, we'll return the params and hash
      const queryString = new URLSearchParams({
        ...params,
        pp_secure_hash: hash,
      }).toString();

      return {
        success: true,
        transactionId: merchantRef,
        status: 'PENDING',
        redirectUrl: `${this.apiUrl}?${queryString}`,
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
      const hash = data.pp_secure_hash;
      const hashParams = { ...data };
      delete hashParams.pp_secure_hash;

      const calculatedHash = this.generateHash(hashParams);
      return calculatedHash === hash;
    } catch (error) {
      return false;
    }
  }

  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
  }
}

export const jazzcashService = new JazzCashPaymentService();
