import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { isConfigured, RAZORPAY_KEY_ID } from './config/razorpay.js';
import { seedDatabase } from './database/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize & Seed Database
seedDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Webhook endpoint requires raw body for HMAC signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Serve static assets from public
app.use(express.static(path.join(__dirname, '../public')));

// Mount API Routes
app.use('/api', apiRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    brand: 'Meher Mahel Luxury Modest Boutique',
    timestamp: new Date().toISOString(),
    razorpay: {
      configured: isConfigured(),
      key_id_set: Boolean(RAZORPAY_KEY_ID),
    },
  });
});

// Single Page Application route fallbacks for friendly client-side routing
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/admin/:path', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`MEHER MAHEL — LUXURY BOUTIQUE E-COMMERCE PLATFORM`);
  console.log(`Storefront: http://localhost:${PORT}`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`API Health: http://localhost:${PORT}/health`);
  console.log(`Payment Status: ${isConfigured() ? 'Active (Live/Test keys)' : 'Awaiting credentials (.env ready)'}`);
  console.log(`=============================================================`);
});

export default app;
