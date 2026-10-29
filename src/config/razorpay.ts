import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
export const DEFAULT_CURRENCY = process.env.CURRENCY || 'INR';

export const isConfigured = (): boolean => {
  return (
    Boolean(RAZORPAY_KEY_ID) &&
    Boolean(RAZORPAY_KEY_SECRET) &&
    !RAZORPAY_KEY_ID.includes('placeholder') &&
    !RAZORPAY_KEY_SECRET.includes('placeholder')
  );
};

export const getRazorpayClient = (): Razorpay => {
  if (!isConfigured()) {
    console.warn(
      '\x1b[33m%s\x1b[0m',
      '[Warning] Razorpay keys are not configured or are using placeholder values. Update your .env file with valid credentials from your Razorpay Dashboard.'
    );
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

export const razorpay = getRazorpayClient();
