import crypto from 'node:crypto';
import { verifyPaymentSignature } from '../services/paymentService.js';
import { RAZORPAY_KEY_SECRET } from '../config/razorpay.js';
console.log('--- Testing Razorpay Payment Signature Verification ---');
// Mock order and payment IDs
const mockOrderId = 'order_test_1234567890';
const mockPaymentId = 'pay_test_9876543210';
// Generate valid HMAC SHA256 signature using current secret
const validBody = `${mockOrderId}|${mockPaymentId}`;
const validSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(validBody)
    .digest('hex');
// Test 1: Valid signature
const testValid = verifyPaymentSignature({
    razorpay_order_id: mockOrderId,
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: validSignature,
});
console.log(`Test 1 (Valid Signature): ${testValid ? 'PASSED (✓)' : 'FAILED (✕)'}`);
// Test 2: Tampered / Invalid signature
const testInvalid = verifyPaymentSignature({
    razorpay_order_id: mockOrderId,
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: 'tampered_signature_999999',
});
console.log(`Test 2 (Tampered Signature): ${!testInvalid ? 'PASSED (✓ rejected correctly)' : 'FAILED (✕)'}`);
// Test 3: Missing fields
const testMissing = verifyPaymentSignature({
    razorpay_order_id: '',
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: validSignature,
});
console.log(`Test 3 (Missing Fields): ${!testMissing ? 'PASSED (✓ rejected correctly)' : 'FAILED (✕)'}`);
if (testValid && !testInvalid && !testMissing) {
    console.log('\nAll payment verification logic tests passed successfully!');
}
else {
    console.error('\nTests failed.');
    process.exit(1);
}
