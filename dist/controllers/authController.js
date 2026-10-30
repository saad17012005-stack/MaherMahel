import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import { signToken } from '../middleware/authMiddleware.js';
// Helper to generate UUID
const generateId = (prefix = 'usr') => {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};
// --------------------------------------------------------
// 1. REGISTER
// --------------------------------------------------------
export const register = async (req, res) => {
    try {
        const { full_name, email, phone, password, confirm_password, consent } = req.body;
        if (!full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email address, and password are required.',
            });
        }
        if (consent === false || consent === 'false') {
            return res.status(400).json({
                success: false,
                message: 'You must agree to the Terms of Service and Privacy Policy to create an account.',
            });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.',
            });
        }
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long.',
            });
        }
        if (confirm_password && password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.',
            });
        }
        // Check if email already exists
        const existing = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(cleanEmail);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists. Please log in instead.',
            });
        }
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const userId = generateId('usr');
        const verificationToken = crypto.randomBytes(24).toString('hex');
        const cleanPhone = phone ? String(phone).trim() : null;
        // 1. Insert into auth_users (Role is strictly customer)
        db.prepare(`
      INSERT INTO auth_users (id, email, password_hash, role, is_verified, verification_token)
      VALUES (?, ?, ?, 'customer', 0, ?)
    `).run(userId, cleanEmail, passwordHash, verificationToken);
        // 2. Insert into profiles
        db.prepare(`
      INSERT INTO profiles (id, email, full_name, phone, role, is_verified)
      VALUES (?, ?, ?, ?, 'customer', 0)
    `).run(userId, cleanEmail, full_name.trim(), cleanPhone);
        const token = signToken({ id: userId, email: cleanEmail, role: 'customer' }, true);
        return res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to Meher Mahel.',
            token,
            user: {
                id: userId,
                email: cleanEmail,
                full_name: full_name.trim(),
                phone: cleanPhone,
                role: 'customer',
                is_verified: false,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
    }
};
// --------------------------------------------------------
// 2. LOGIN
// --------------------------------------------------------
export const login = async (req, res) => {
    try {
        const { email, password, remember_me } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email address and password are required.',
            });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const user = db.prepare('SELECT * FROM auth_users WHERE email = ?').get(cleanEmail);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email address or password.',
            });
        }
        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email address or password.',
            });
        }
        const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(user.id);
        if (profile && profile.is_suspended) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended by administration. Please contact concierge@mehermahel.com.',
            });
        }
        const token = signToken({ id: user.id, email: user.email, role: user.role }, Boolean(remember_me));
        return res.json({
            success: true,
            message: 'Signed in successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile?.full_name || 'Valued Customer',
                phone: profile?.phone || '',
                avatar_url: profile?.avatar_url || '',
                role: user.role,
                is_verified: Boolean(profile?.is_verified),
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Login failed.' });
    }
};
// --------------------------------------------------------
// 3. GET CURRENT AUTHENTICATED USER (ME)
// --------------------------------------------------------
export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthenticated.' });
        }
        const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }
        return res.json({
            success: true,
            user: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
                role: profile.role,
                is_verified: Boolean(profile.is_verified),
                created_at: profile.created_at,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 4. FORGOT PASSWORD
// --------------------------------------------------------
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }
        const cleanEmail = String(email).trim().toLowerCase();
        const user = db.prepare('SELECT id FROM auth_users WHERE email = ?').get(cleanEmail);
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
            db.prepare(`
        UPDATE auth_users
        SET reset_token = ?, reset_token_expires = ?
        WHERE id = ?
      `).run(resetToken, resetExpires, user.id);
            console.log(`[Auth Notice] Password Reset Link for ${cleanEmail}: /auth.html?mode=reset&token=${resetToken}`);
        }
        // Always return success message to avoid email enumeration
        return res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been dispatched.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 5. RESET PASSWORD
// --------------------------------------------------------
export const resetPassword = async (req, res) => {
    try {
        const { token, new_password, confirm_password } = req.body;
        if (!token || !new_password) {
            return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }
        if (confirm_password && new_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }
        const user = db.prepare('SELECT * FROM auth_users WHERE reset_token = ?').get(token);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired password reset link.' });
        }
        if (user.reset_token_expires && new Date(user.reset_token_expires).getTime() < Date.now()) {
            return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
        }
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(new_password, salt);
        db.prepare(`
      UPDATE auth_users
      SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL
      WHERE id = ?
    `).run(newHash, user.id);
        return res.json({
            success: true,
            message: 'Your password has been successfully updated. You may now sign in.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 6. VERIFY EMAIL
// --------------------------------------------------------
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required.' });
        }
        const user = db.prepare('SELECT id FROM auth_users WHERE verification_token = ?').get(token);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or already used verification token.' });
        }
        db.prepare('UPDATE auth_users SET is_verified = 1, verification_token = NULL WHERE id = ?').run(user.id);
        db.prepare('UPDATE profiles SET is_verified = 1 WHERE id = ?').run(user.id);
        return res.json({
            success: true,
            message: 'Your email address has been successfully verified.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 7. CHANGE PASSWORD (AUTHENTICATED)
// --------------------------------------------------------
export const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { current_password, new_password, confirm_password } = req.body;
        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Current and new password are required.' });
        }
        if (new_password.length < 8) {
            return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
        }
        if (confirm_password && new_password !== confirm_password) {
            return res.status(400).json({ success: false, message: 'New passwords do not match.' });
        }
        const authRecord = db.prepare('SELECT password_hash FROM auth_users WHERE id = ?').get(req.user.id);
        if (!authRecord || !bcrypt.compareSync(current_password, authRecord.password_hash)) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        }
        const salt = bcrypt.genSaltSync(10);
        const newHash = bcrypt.hashSync(new_password, salt);
        db.prepare('UPDATE auth_users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);
        return res.json({
            success: true,
            message: 'Your password has been changed successfully.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 8. DELETE ACCOUNT
// --------------------------------------------------------
export const deleteAccount = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password confirmation is required to delete account.' });
        }
        const authRecord = db.prepare('SELECT password_hash, role FROM auth_users WHERE id = ?').get(req.user.id);
        if (!authRecord || !bcrypt.compareSync(password, authRecord.password_hash)) {
            return res.status(400).json({ success: false, message: 'Incorrect password.' });
        }
        if (authRecord.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Root administrator account cannot be self-deleted.' });
        }
        db.prepare('DELETE FROM user_addresses WHERE user_id = ?').run(req.user.id);
        db.prepare('DELETE FROM user_wishlists WHERE user_id = ?').run(req.user.id);
        db.prepare('DELETE FROM profiles WHERE id = ?').run(req.user.id);
        db.prepare('DELETE FROM auth_users WHERE id = ?').run(req.user.id);
        return res.json({
            success: true,
            message: 'Your account and personal data have been completely removed.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
