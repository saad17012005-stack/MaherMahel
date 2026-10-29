---
name: razorpay-automation
description: Comprehensive playbook and reference for automating Razorpay payments, order generation, HMAC SHA-256 signature verification, webhook processing, refund handling, and testing.
---

# Razorpay Payment Automation Playbook

This skill outlines how to automate and manage Razorpay payment workflows in Node.js/TypeScript.

## 1. Credentials & Configuration

Stored in `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_... # or rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
CURRENCY=INR
PORT=5000
```

To switch from placeholder/test to live:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** → **API Keys**.
3. Generate Key ID and Key Secret.
4. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
5. For webhooks, go to **Settings** → **Webhooks**, add your endpoint URL (`/api/payments/webhook`), and set `RAZORPAY_WEBHOOK_SECRET`.

---

## 2. Server Architecture & Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/payments/config` | `GET` | Returns Key ID & Currency for frontend checkout modal |
| `/api/payments/create-order` | `POST` | Generates a new order (converts ₹ to paise) |
| `/api/payments/verify` | `POST` | Cryptographically verifies HMAC SHA-256 payment signature |
| `/api/payments/payment/:paymentId` | `GET` | Fetches payment status and details from Razorpay API |
| `/api/payments/refund` | `POST` | Issues instant or standard refunds (full or partial) |
| `/api/payments/webhook` | `POST` | Listens to asynchronous Razorpay event webhooks |
| `/health` | `GET` | Returns API status and credential readiness |

---

## 3. Order Creation Workflow

Razorpay requires amounts in **subunits** (e.g. 1 INR = 100 paise).

```typescript
const order = await razorpay.orders.create({
  amount: Math.round(amountInRupees * 100),
  currency: 'INR',
  receipt: 'rcpt_' + Date.now(),
  notes: { customerId: '12345' }
});
```

---

## 4. Payment Signature Verification

Never mark an order as paid without verifying the HMAC SHA-256 signature:

```typescript
import crypto from 'node:crypto';

const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

const isValid = generatedSignature === razorpay_signature;
```

---

## 5. Webhook Signature Verification

Webhook signatures are verified against the **raw request body buffer**:

```typescript
import Razorpay from 'razorpay';

const isValid = Razorpay.validateWebhookSignature(
  rawBodyBuffer.toString('utf-8'),
  req.headers['x-razorpay-signature'],
  process.env.RAZORPAY_WEBHOOK_SECRET!
);
```

### Supported Webhook Events:
- `order.paid` — Trigger order fulfillment and database updates.
- `payment.captured` — Payment successfully debited from customer.
- `payment.failed` — Notify customer and offer alternative payment methods.
- `refund.processed` — Confirm refund completion.

---

## 6. Running & Testing

- **Dev mode**: `npm run dev` (starts on port 5000 with hot-reload)
- **Production build**: `npm run build`
- **Start compiled**: `npm start`
- **Verify signature tests**: `npm run test:verify`
- **Frontend test checkout**: Open `http://localhost:5000` in a browser.
