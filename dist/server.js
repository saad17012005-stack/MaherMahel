import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
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
app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: true }));
// Helper to reliably find public assets across local and Vercel environments
const resolvePublicFile = (fileName) => {
    const candidates = [
        path.join(__dirname, '../public', fileName),
        path.join(process.cwd(), 'public', fileName),
        path.join(process.cwd(), fileName),
    ];
    return candidates.find(p => fs.existsSync(p)) || candidates[0];
};
// Serve static assets from public folder
const publicDir = [
    path.join(__dirname, '../public'),
    path.join(process.cwd(), 'public'),
].find(d => fs.existsSync(d)) || path.join(__dirname, '../public');
app.use(express.static(publicDir));
// Mount API Routes (support both /api and root paths for serverless compatibility)
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);
app.use('/api', apiRoutes);
app.use(apiRoutes);
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
// Explicit frontend routes
app.get('/', (_req, res) => {
    res.sendFile(resolvePublicFile('index.html'));
});
app.get('/admin', (_req, res) => {
    res.sendFile(resolvePublicFile('admin.html'));
});
app.get('/admin/:path', (_req, res) => {
    res.sendFile(resolvePublicFile('admin.html'));
});
// Start Server if not running in serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`=============================================================`);
        console.log(`MEHER MAHEL — LUXURY BOUTIQUE E-COMMERCE PLATFORM`);
        console.log(`Storefront: http://localhost:${PORT}`);
        console.log(`Admin Dashboard: http://localhost:${PORT}/admin`);
        console.log(`API Health: http://localhost:${PORT}/health`);
        console.log(`Payment Status: ${isConfigured() ? 'Active (Live/Test keys)' : 'Awaiting credentials (.env ready)'}`);
        console.log(`=============================================================`);
    });
}
export default app;
