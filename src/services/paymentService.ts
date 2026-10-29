import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import {
  razorpay,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  DEFAULT_CURRENCY,
  isConfigured,
} from '../config/razorpay.js';

export interface CreateOrderParams {
  amount: number; // In base currency units (e.g. INR 500)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerificationParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RefundParams {
  paymentId: string;
  amount?: number; // Optional partial refund in base units
  notes?: Record<string, string>;
  speed?: 'normal' | 'optimum';
}

/**
 * Creates an order in Razorpay.
 * Amounts are converted to subunits (e.g., INR -> Paise by multiplying by 100).
 */
export async function createOrder(params: CreateOrderParams) {
  if (!isConfigured()) {
    throw new Error(
      'Razorpay credentials not configured. Please supply valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'
    );
  }

  const { amount, currency = DEFAULT_CURRENCY, receipt, notes = {} } = params;

  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  // Convert to paise/smallest currency unit
  const amountInSubunits = Math.round(amount * 100);

  const options = {
    amount: amountInSubunits,
    currency,
    receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    notes: {
      ...notes,
      created_at: new Date().toISOString(),
    },
  };

  const order = await razorpay.orders.create(options);
  return order;
}

/**
 * Verifies the authenticity of Razorpay payment signatures (HMAC SHA-256).
 */
export function verifyPaymentSignature(params: VerificationParams): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  const expectedBody = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(expectedBody)
    .digest('hex');

  return generatedSignature === razorpay_signature;
}

/**
 * Validates webhook signatures using the Webhook Secret.
 */
export function verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured in .env.');
  }

  const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
  return Razorpay.validateWebhookSignature(bodyString, signature, RAZORPAY_WEBHOOK_SECRET);
}

/**
 * Fetches details for a specific payment ID.
 */
export async function fetchPaymentDetails(paymentId: string) {
  if (!isConfigured()) {
    throw new Error('Razorpay credentials not configured.');
  }
  return await razorpay.payments.fetch(paymentId);
}

/**
 * Automates refund processing (full or partial).
 */
export async function processRefund(params: RefundParams) {
  if (!isConfigured()) {
    throw new Error('Razorpay credentials not configured.');
  }

  const { paymentId, amount, notes = {}, speed = 'normal' } = params;

  const refundOptions: any = {
    notes,
    speed,
  };

  if (amount && amount > 0) {
    refundOptions.amount = Math.round(amount * 100);
  }

  return await razorpay.payments.refund(paymentId, refundOptions);
}

/**
 * Dispatches automated actions based on incoming webhook events.
 */
export async function handleWebhookEvent(event: string, payload: any) {
  console.log(`[Payment Automation] Processing webhook event: ${event}`);

  switch (event) {
    case 'order.paid': {
      const order = payload.order.entity;
      const payment = payload.payment?.entity;
      console.log(`[Payment Automation] Order paid: ${order.id}, Amount: ${order.amount / 100} ${order.currency}`);
      // Automated fulfillment hooks can be added here
      break;
    }
    case 'payment.captured': {
      const payment = payload.payment.entity;
      console.log(`[Payment Automation] Payment captured: ${payment.id}, Method: ${payment.method}`);
      break;
    }
    case 'payment.failed': {
      const payment = payload.payment.entity;
      console.warn(`[Payment Automation] Payment failed: ${payment.id}, Reason: ${payment.error_description}`);
      break;
    }
    case 'refund.processed': {
      const refund = payload.refund.entity;
      console.log(`[Payment Automation] Refund processed: ${refund.id}, Amount: ${refund.amount / 100}`);
      break;
    }
    default:
      console.log(`[Payment Automation] Unhandled webhook event: ${event}`);
  }

  return { status: 'processed', event };
}
