import { Router } from 'express';
import {
  getConfig,
  createOrderHandler,
  verifyPaymentHandler,
  fetchPaymentHandler,
  refundPaymentHandler,
  webhookHandler,
} from '../controllers/paymentController.js';

const router = Router();

// Public configuration (Key ID for frontend checkout modal)
router.get('/config', getConfig);

// Core Payment Automation Endpoints
router.post('/create-order', createOrderHandler);
router.post('/verify', verifyPaymentHandler);
router.get('/payment/:paymentId', fetchPaymentHandler);
router.post('/refund', refundPaymentHandler);
router.post('/webhook', webhookHandler);

export default router;
