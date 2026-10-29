# Meher Mahel — Premium Women's Modest Boutique E-Commerce Platform

> *“Draped in grace.”*

A boutique-style fashion and lifestyle e-commerce platform engineered specifically for **Meher Mahel**, featuring ready-to-wear abayas, bespoke made-to-measure custom abayas, traditional wear, luxury structured handbags, heirloom watches, and an atelier administrator portal.

---

## Brand Identity & Aesthetic Foundation

- **Dusty Rose / Rose Satin**: `#C88F91`
- **Deep Rose Accent**: `#A9676C`
- **Antique Gold**: `#C6A15B`
- **Champagne Gold**: `#E4CC9A`
- **Ivory Background**: `#FAF7F2`
- **Pure White**: `#FFFFFF`
- **Deep Charcoal**: `#292526`
- **Muted Body Text**: `#777071`
- **Subtle Borders**: `#E9DFD9`
- **Typography**: Cormorant Garamond & Playfair Display (Serif), Inter (Sans-serif)
- **Primary Brand Logo**: Integrated directly from your uploaded high-resolution asset (`public/images/logo.jpg`).

---

## Core Features

### 1. Storefront Experience
- **Top Announcement Bar**: Dynamic boutique message, fully editable in real-time from the Admin Dashboard.
- **Sticky Luxury Header**: Includes brand logo, mega navigation menu, live keyword search modal, wishlist counter, and cart drawer.
- **Hero Carousel (Highest Priority Feature)**:
  - Editorial viewport carousel with smooth 5.5s auto-rotation, crossfade, and subtle Ken Burns image motion.
  - Pauses on desktop hover; supports mobile touch gestures.
  - Previous/next controls, pagination progress indicators, and custom primary/secondary CTAs.
  - All slides, headings, and destinations are manageable via the Admin CMS.
- **Shop by Category**: 4 large editorial tiles (Abayas, Traditional Wear, Handbags, Watches).
- **Curated Catalog & New Arrivals**: Responsive product cards with color swatches, compare-at discounts, sale badges, wishlist toggles, and Quick-View modal.
- **Signature Custom Abaya Atelier (6-Step Interactive Consultation)**:
  - **Step 1 — Silhouette**: Closed Abaya, Open-Front, Butterfly, Kimono.
  - **Step 2 — Fabric & Shade**: Premium Matte Crepe, Silk-Blend Velvet, Double-Layer Korean Chiffon, Royal Nida, with artisanal shade swatches.
  - **Step 3 — Embellishments**: Pearl droplet cuffs, antique gold seam trims, hand-embroidered floral hem, concealed pockets.
  - **Step 4 — Measurements**: Length, shoulder, bust, waist, hips, sleeve length.
  - **Step 5 — Special Instructions**: Notes for the tailor and live pricing calculator.
  - **Step 6 — Review & Add to Bag**: Complete measurement snapshot saved and persisted through checkout and into the tailoring queue.
- **Interactive Size Guide**: Height-to-abaya-length converter and illustrated measurement instructions.
- **Sliding Shopping Bag Drawer**: Real-time subtotal, coupon code engine (`WELCOME10`, `ELEGANCE15`), tax calculations, and shipping fee logic.
- **Order Tracking**: Real-time order progress timeline (Order Placed → Payment Confirmed → Atelier Production → Dispatched → Delivered).
- **Floating WhatsApp Concierge**: Instant direct messaging with the boutique atelier.

---

### 2. Automated Payment Integration (Razorpay)
- **Official Open-Source SDK**: Powered by `razorpay` Node.js SDK.
- **Order Generation**: Automatic conversion to currency subunits (Paise for INR), receipt assignment, and metadata tagging.
- **Cryptographic Signature Validation**: Server-side HMAC SHA-256 signature verification preventing payment tampering.
- **Webhook Automation**: Raw body validation for `x-razorpay-signature` handling `order.paid`, `payment.captured`, `payment.failed`, and `refund.processed`.
- **Checkout Modal**: Uses [Razorpay Standard Checkout](https://checkout.razorpay.com/v1/checkout.js).
- **Awaiting Account Details**: Pre-configured in `.env` with placeholder guards. As soon as you add your keys, live/test payments activate automatically without changing any code.

---

### 3. Administrator Atelier Portal (`/admin`)
- **Executive KPIs**: Real-time revenue from verified payments, total orders, pending fulfillments, low-stock alerts, and custom abayas in queue.
- **Order Management**: Search, filter, update fulfillment status (`Order Placed`, `Payment Confirmed`, `In Production`, `Shipped`, `Delivered`, `Cancelled`), record courier tracking numbers, and update payment status.
- **Bespoke Abaya Queue**: Dedicated inspection view for client tailor measurements (length, bust, shoulder, waist, hips, sleeve), fabric selections, and production milestone tracking (`Awaiting Review`, `Pattern Cutting`, `Stitching`, `Quality Check`, `Ready to Dispatch`).
- **Product Management**: Add new products, edit pricing and inventory, upload images, toggle *New Arrival* or *Best Seller*, and archive/delete pieces.
- **Hero Carousel CMS**: Live editing of slide images, headings, descriptions, and CTA links.
- **Boutique Settings**: Update announcement bar text, WhatsApp phone number, flat-rate shipping, free-shipping threshold, and tax rates.

---

## Getting Started

### 1. Start the Platform
```bash
npm run dev
```
- Storefront: [http://localhost:5000](http://localhost:5000)
- Admin Portal: [http://localhost:5000/admin](http://localhost:5000/admin)
- Health Check: [http://localhost:5000/health](http://localhost:5000/health)

### 2. Add Your Razorpay Account Details (When Ready)
Open `.env` and replace the placeholders:
```env
RAZORPAY_KEY_ID=rzp_test_YourKeyHere
RAZORPAY_KEY_SECRET=YourSecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
PORT=5000
CURRENCY=INR
```

### 3. Build & Production Commands
- `npm run build` — Compiles TypeScript into `dist/`
- `npm start` — Starts compiled production server
- `npm run test:verify` — Runs automated signature verification tests
