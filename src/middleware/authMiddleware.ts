import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'meher_mahel_jwt_secret_production_key_2026_luxury_boutique';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  full_name: string;
  is_verified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const signToken = (payload: { id: string; email: string; role: string }, rememberMe: boolean = true): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h',
  });
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    } else if (req.query?.token) {
      token = String(req.query.token).trim();
    }

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

    // Verify user exists and check suspension status
    const profile = db.prepare('SELECT id, email, full_name, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id) as any;

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

    req.user = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name,
      is_verified: Boolean(profile.is_verified),
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
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrative privileges required.',
      });
    }
    next();
  });
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || (req.headers['x-auth-token'] as string);
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    } else if (req.query?.token) {
      token = String(req.query.token).trim();
    }

    if (!token) {
      req.user = undefined;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.id) {
      const profile = db.prepare('SELECT id, email, full_name, role, is_verified, is_suspended FROM profiles WHERE id = ?').get(decoded.id) as any;
      if (profile && !profile.is_suspended) {
        req.user = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name,
          is_verified: Boolean(profile.is_verified),
        };
      }
    }
  } catch {}
  next();
};
