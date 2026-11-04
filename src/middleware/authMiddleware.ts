import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'meher_mahel_jwt_secret_production_key_2026_luxury_boutique';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Server-side Authorised Admin Email Allowlist
export const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST || 'lmbhfarah@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAIL_ALLOWLIST.includes(String(email).trim().toLowerCase());
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  full_name: string;
  is_verified: boolean;
  avatar_url?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const signToken = (payload: { id: string; email: string; role: string }, rememberMe: boolean = true): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h',
  });
};

export const extractToken = (req: Request): string => {
  const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (authHeader) {
    return authHeader.trim();
  }
  if ((req as any).cookies && (req as any).cookies.auth_token) {
    return String((req as any).cookies.auth_token).trim();
  }
  if (req.query?.token) {
    return String(req.query.token).trim();
  }
  return '';
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
      });
    }

    const cleanEmail = String(decoded.email || '').trim().toLowerCase();

    // Verify user exists and check suspension status
    let profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id) as any;
    if (!profile && cleanEmail) {
      profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE email = ?').get(cleanEmail) as any;
    }

    // Auto-heal admin profile for allowlisted owner
    const isAllowlisted = isAdminEmail(cleanEmail);
    if (isAllowlisted && (!profile || profile.role !== 'admin')) {
      if (profile) {
        db.prepare("UPDATE profiles SET role = 'admin', is_verified = 1 WHERE email = ?").run(cleanEmail);
        profile.role = 'admin';
        profile.is_verified = 1;
      } else {
        db.prepare(`
          INSERT INTO profiles (id, email, full_name, phone, role, is_verified)
          VALUES (?, ?, 'Farah (Administrator)', '+91 76098 74187', 'admin', 1)
        `).run(decoded.id, cleanEmail);
        profile = {
          id: decoded.id,
          email: cleanEmail,
          full_name: 'Farah (Administrator)',
          role: 'admin',
          is_verified: 1,
          is_suspended: 0,
        };
      }
    }

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
    const effectiveRole: 'customer' | 'admin' = (isAllowlisted || profile.role === 'admin') && isAllowlisted ? 'admin' : 'customer';

    req.user = {
      id: profile.id,
      email: profile.email,
      role: effectiveRole,
      full_name: profile.full_name,
      is_verified: Boolean(profile.is_verified),
      avatar_url: profile.avatar_url,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please sign in again.',
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.id) {
      const cleanEmail = String(decoded.email || '').trim().toLowerCase();
      let profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id) as any;
      if (!profile && cleanEmail) {
        profile = db.prepare('SELECT id, email, full_name, avatar_url, role, is_verified, is_suspended FROM profiles WHERE email = ?').get(cleanEmail) as any;
      }
      if (profile && !profile.is_suspended) {
        const isAllowlisted = isAdminEmail(profile.email);
        const effectiveRole: 'customer' | 'admin' = (isAllowlisted || profile.role === 'admin') && isAllowlisted ? 'admin' : 'customer';

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
  } catch {}
  next();
};
