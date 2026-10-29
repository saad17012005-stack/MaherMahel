import type { Request, Response } from 'express';
import {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  fetchPaymentDetails,
  processRefund,
  handleWebhookEvent,
} from '../services/paymentService.js';
import { RAZORPAY_KEY_ID, DEFAULT_CURRENCY, isConfigured } from '../config/razorpay.js';

export const getConfig = (_req: Request, res: Response) => {
  res.json({
    success: true,
    key_id: RAZORPAY_KEY_ID,
    currency: DEFAULT_CURRENCY,
    is_configured: isConfigured(),
  });
};

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount must be a positive number.',
      });
    }

    const order = await createOrder({
      amount: Number(amount),
      currency,
      receipt,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order,
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order.',
    });
  }
};

export const verifyPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, razorpay_signature.',
      });
    }

    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature.',
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
    });
  } catch (error: any) {
    console.error('[Verify Payment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment.',
    });
  }
};

export const fetchPaymentHandler = async (req: Request, res: Response) => {
  try {
    const paymentId = Array.isArray(req.params.paymentId) ? req.params.paymentId[0] : req.params.paymentId;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required.' });
    }
    const payment = await fetchPaymentDetails(paymentId);
    return res.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    console.error('[Fetch Payment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment details.',
    });
  }
};

export const refundPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { paymentId, amount, notes, speed } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: paymentId',
      });
    }

    const refund = await processRefund({
      paymentId,
      amount: amount ? Number(amount) : undefined,
      notes,
      speed,
    });

    return res.json({
      success: true,
      message: 'Refund processed successfully.',
      refund,
    });
  } catch (error: any) {
    console.error('[Refund Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund.',
    });
  }
};

export const webhookHandler = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing x-razorpay-signature header' });
    }

    // rawBody is attached by express.raw / custom middleware
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.warn('[Webhook Warning]: Invalid webhook signature received.');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;
    await handleWebhookEvent(event, payload);

    return res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('[Webhook Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Webhook processing failed',
    });
  }
};
