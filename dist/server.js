import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import paymentRoutes from './routes/paymentRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { isConfigured, RAZORPAY_KEY_ID } from './config/razorpay.js';
import { seedDatabase } from './database/seed.js';
import { JWT_SECRET, isAdminEmail } from './middleware/authMiddleware.js';
import { db } from './database/db.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Initialize & Seed Database
seedDatabase();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(cookieParser());
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
// Intercept direct static requests to admin.html so unauthorized static access is impossible
app.use((req, res, next) => {
    if (req.path === '/admin.html' || req.path.endsWith('/admin.html')) {
        return res.redirect('/admin');
    }
    next();
});
app.use(express.static(publicDir));
// Luxury Branded 403 Access Denied Page for Unauthorized Users
const renderUnauthorizedHtml = (email) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied — Restricted Access — Meher Mahel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#FAF7F2] text-[#292526] font-sans min-h-screen flex items-center justify-center p-4 selection:bg-[#C88F91]/20">
  <div class="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#E9DFD9] text-center relative overflow-hidden">
    <div class="absolute -top-16 -right-16 w-36 h-36 bg-[#C88F91]/10 rounded-full blur-2xl pointer-events-none"></div>
    <div class="w-16 h-16 bg-[#C88F91]/15 text-[#A9676C] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C88F91]/30 shadow-inner">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    </div>
    <span class="text-[10px] uppercase tracking-[0.25em] text-[#C6A15B] font-bold block mb-1">SECURITY RESTRICTION</span>
    <h1 class="font-serif text-3xl font-bold text-[#292526] mb-2">Access Denied</h1>
    <p class="text-xs text-[#777071] leading-relaxed mb-6">
      The Meher Mahel Atelier Administrative Portal is strictly reserved for the authorised store owner (<strong class="text-[#292526]">lmbhfarah@gmail.com</strong>).
    </p>
    ${email ? `<div class="p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#777071] mb-6 border border-[#E9DFD9]">Signed in as: <strong class="text-[#292526]">${email}</strong> (Role: Customer)</div>` : ''}
    <div class="space-y-3">
      <a href="/" class="block w-full py-3.5 bg-[#C88F91] hover:bg-[#A9676C] text-white text-xs uppercase tracking-widest font-semibold rounded-xl transition-all shadow-md">
        Return to Boutique Storefront
      </a>
      <a href="/login?redirect=/admin" class="block w-full py-3.5 bg-transparent hover:bg-slate-50 text-[#777071] hover:text-[#292526] text-xs uppercase tracking-widest font-semibold rounded-xl border border-[#E9DFD9] transition-all">
        Sign in with Authorised Account
      </a>
    </div>
  </div>
</body>
</html>`;
// Server-side Route Guard for Administrator Pages
const adminPageGuard = (req, res, next) => {
    try {
        let token = '';
        if (req.cookies && req.cookies.auth_token) {
            token = String(req.cookies.auth_token).trim();
        }
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7).trim();
        }
        else if (req.query?.token) {
            token = String(req.query.token).trim();
        }
        if (!token) {
            return res.redirect('/login?redirect=/admin&error=' + encodeURIComponent('Please sign in to access the administrator portal.'));
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.redirect('/login?redirect=/admin&error=' + encodeURIComponent('Your session has expired. Please sign in again.'));
        }
        if (!isAdminEmail(decoded.email)) {
            return res.status(403).send(renderUnauthorizedHtml(decoded.email));
        }
        const profile = db.prepare('SELECT id, email, role, is_suspended FROM profiles WHERE id = ?').get(decoded.id);
        if (!profile || profile.role !== 'admin' || !isAdminEmail(profile.email) || profile.is_suspended) {
            return res.status(403).send(renderUnauthorizedHtml(profile?.email || decoded.email));
        }
        // Verified administrator
        next();
    }
    catch {
        return res.redirect('/login?redirect=/admin&error=' + encodeURIComponent('Your session has expired. Please sign in again.'));
    }
};
// Mount API Routes (all API endpoints served under /api)
app.use('/api/payments', paymentRoutes);
app.use('/payments', paymentRoutes);
app.use('/api', apiRoutes);
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
app.get('/account', (_req, res) => {
    res.sendFile(resolvePublicFile('account.html'));
});
app.get('/reelmark', (_req, res) => {
    res.sendFile(resolvePublicFile('reelmark.html'));
});
app.get(['/login', '/register', '/forgot-password', '/reset-password'], (_req, res) => {
    res.sendFile(resolvePublicFile('auth.html'));
});
// Strictly Protected Administrator Frontend Routes
app.get(/^\/admin(?:\/.*)?$/, adminPageGuard, (_req, res) => {
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
