import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholder_webhook';
export const DEFAULT_CURRENCY = process.env.CURRENCY || 'INR';

export const isConfigured = (): boolean => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return (
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId?.includes('placeholder') &&
    !keySecret?.includes('placeholder')
  );
};

export const getRazorpayClient = (): Razorpay => {
  if (!isConfigured()) {
    console.warn(
      '[Warning] Razorpay keys are not configured or are using placeholder values. Update your environment variables with valid credentials from your Razorpay Dashboard.'
    );
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

export const razorpay = getRazorpayClient();
