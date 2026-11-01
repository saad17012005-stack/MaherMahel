import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
export const JWT_SECRET = process.env.JWT_SECRET || 'meher_mahel_jwt_secret_production_key_2026_luxury_boutique';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// Server-side Authorised Admin Email Allowlist
export const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST || 'lmbhfarah@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
export const isAdminEmail = (email) => {
    if (!email)
        return false;
    return ADMIN_EMAIL_ALLOWLIST.includes(String(email).trim().toLowerCase());
};
export const signToken = (payload, rememberMe = true) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: rememberMe ? '30d' : '24h',
    });
};
export const extractToken = (req) => {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7).trim();
    }
    if (authHeader) {
        return authHeader.trim();
    }
    if (req.cookies && req.cookies.auth_token) {
        return String(req.cookies.auth_token).trim();
    }
    if (req.query?.token) {
        return String(req.query.token).trim();
    }
    return '';
};
export const requireAuth = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in to continue.',
            });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session token. Please log in again.',
            });
        }
        // Verify user exists and check suspension status
        const profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id);
        if (!profile) {
            return res.status(401).json({
                success: false,
                message: 'Account not found. Please log in again.',
            });
        }
        if (profile.is_suspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by administration. Please contact concierge@mehermahel.com.',
            });
        }
        // Strictly enforce server-side allowlist for admin role
        const isAllowlisted = isAdminEmail(profile.email);
        const effectiveRole = (profile.role === 'admin' && isAllowlisted) ? 'admin' : 'customer';
        req.user = {
            id: profile.id,
            email: profile.email,
            role: effectiveRole,
            full_name: profile.full_name,
            is_verified: Boolean(profile.is_verified),
            avatar_url: profile.avatar_url,
        };
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Session has expired or is invalid. Please sign in again.',
        });
    }
};
export const requireAdmin = (req, res, next) => {
    requireAuth(req, res, () => {
        if (!req.user || req.user.role !== 'admin' || !isAdminEmail(req.user.email)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Authorised administrative privileges required.',
            });
        }
        next();
    });
};
export const optionalAuth = (req, _res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            req.user = undefined;
            return next();
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
            const profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id);
            if (profile && !profile.is_suspended) {
                const isAllowlisted = isAdminEmail(profile.email);
                const effectiveRole = (profile.role === 'admin' && isAllowlisted) ? 'admin' : 'customer';
                req.user = {
                    id: profile.id,
                    email: profile.email,
                    role: effectiveRole,
                    full_name: profile.full_name,
                    is_verified: Boolean(profile.is_verified),
                    avatar_url: profile.avatar_url,
                };
            }
        }
    }
    catch { }
    next();
};
