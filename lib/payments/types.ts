// Payment gateway types and interfaces

export enum PaymentGateway {
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
  STRIPE = 'STRIPE',
}

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  gateway: PaymentGateway;
  invoiceNumber?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  redirectUrl?: string;
  error?: string;
}

export interface WebhookPayload {
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  amount: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// JazzCash specific types
export interface JazzCashConfig {
  merchantId: string;
  password: string;
  returnUrl: string;
}

export interface JazzCashRequest {
  pp_merchant_id: string;
  pp_password: string;
  pp_version: string;
  pp_txn_type: string;
  pp_language: string;
  pp_merchant_ref: string;
  pp_amount: string;
  pp_bill_reference: string;
  pp_description: string;
  pp_notify_url: string;
  pp_return_url: string;
  pp_irn: string;
}

// Easypaisa specific types
export interface EasypaisaConfig {
  merchantId: string;
  password: string;
  returnUrl: string;
}

// Stripe specific types
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
}
