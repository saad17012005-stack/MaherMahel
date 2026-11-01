import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import { signToken, isAdminEmail } from '../middleware/authMiddleware.js';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
// Public Google OAuth Client Config
export const getGoogleAuthConfig = (_req, res) => {
    return res.json({
        clientId: GOOGLE_CLIENT_ID,
    });
};
// Helper to generate UUID
const generateId = (prefix = 'usr') => {
    return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
};
// Helper to set secure auth cookie
const setAuthCookie = (res, token, rememberMe = true) => {
    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge,
        path: '/',
    });
};
// Helper to clear auth cookie
const clearAuthCookie = (res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
    });
};
// Helper: Provision or link a Google authenticated user
async function provisionGoogleUser({ email, name, picture, email_verified, }) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!email_verified) {
        throw new Error('Google email address is not verified.');
    }
    const isOwner = isAdminEmail(cleanEmail);
    const targetRole = isOwner ? 'admin' : 'customer';
    // Check if profile exists
    let profile = db.prepare('SELECT id, email, full_name, phone, avatar_url, role, is_suspended, is_verified FROM profiles WHERE email = ?').get(cleanEmail);
    if (profile) {
        if (profile.is_suspended) {
            throw new Error('Your account has been suspended by administration. Please contact concierge@mehermahel.com.');
        }
        // Update existing profile (and ensure admin role if allowlisted)
        db.prepare(`
      UPDATE profiles
      SET full_name = COALESCE(?, full_name),
          avatar_url = COALESCE(?, avatar_url),
          role = ?,
          is_verified = 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, picture || null, targetRole, profile.id);
        try {
            db.prepare(`
        UPDATE auth_users
        SET role = ?, is_verified = 1, updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).run(targetRole, cleanEmail);
        }
        catch { }
        profile.role = targetRole;
        profile.avatar_url = picture || profile.avatar_url;
        profile.full_name = name || profile.full_name;
        profile.is_verified = 1;
        return profile;
    }
    else {
        // Brand new user from Google
        const userId = generateId('usr');
        const dummyHash = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);
        db.prepare(`
      INSERT INTO auth_users (id, email, password_hash, role, is_verified, verification_token)
      VALUES (?, ?, ?, ?, 1, NULL)
    `).run(userId, cleanEmail, dummyHash, targetRole);
        db.prepare(`
      INSERT INTO profiles (id, email, full_name, phone, avatar_url, role, is_verified)
      VALUES (?, ?, ?, NULL, ?, ?, 1)
    `).run(userId, cleanEmail, name, picture || null, targetRole);
        return {
            id: userId,
            email: cleanEmail,
            full_name: name,
            avatar_url: picture || null,
            role: targetRole,
            is_verified: true,
        };
    }
}
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
        const isOwner = isAdminEmail(cleanEmail);
        const assignedRole = isOwner ? 'admin' : 'customer';
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);
        const userId = generateId('usr');
        const verificationToken = crypto.randomBytes(24).toString('hex');
        const cleanPhone = phone ? String(phone).trim() : null;
        // 1. Insert into auth_users
        db.prepare(`
      INSERT INTO auth_users (id, email, password_hash, role, is_verified, verification_token)
      VALUES (?, ?, ?, ?, 0, ?)
    `).run(userId, cleanEmail, passwordHash, assignedRole, verificationToken);
        // 2. Insert into profiles
        db.prepare(`
      INSERT INTO profiles (id, email, full_name, phone, role, is_verified)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(userId, cleanEmail, full_name.trim(), cleanPhone, assignedRole);
        const token = signToken({ id: userId, email: cleanEmail, role: assignedRole }, true);
        setAuthCookie(res, token, true);
        return res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to Meher Mahel.',
            token,
            user: {
                id: userId,
                email: cleanEmail,
                full_name: full_name.trim(),
                phone: cleanPhone,
                role: assignedRole,
                is_verified: false,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
    }
};
// --------------------------------------------------------
// 2. LOGIN (Email & Password)
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
        // Role check: Only allowlist receives admin privileges
        const isOwner = isAdminEmail(cleanEmail);
        const effectiveRole = isOwner ? 'admin' : (user.role === 'admin' ? 'customer' : user.role);
        const token = signToken({ id: user.id, email: user.email, role: effectiveRole }, Boolean(remember_me !== false));
        setAuthCookie(res, token, Boolean(remember_me !== false));
        return res.json({
            success: true,
            message: effectiveRole === 'admin' ? 'Welcome back, Administrator Farah.' : 'Signed in successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: profile?.full_name || 'Valued Customer',
                phone: profile?.phone || '',
                avatar_url: profile?.avatar_url || '',
                role: effectiveRole,
                is_verified: Boolean(profile?.is_verified),
            },
            redirectUrl: effectiveRole === 'admin' ? '/admin' : '/account',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Login failed.' });
    }
};
// --------------------------------------------------------
// 3. GOOGLE SIGN IN (POST: Token-based via Google Identity Services)
// --------------------------------------------------------
export const loginWithGoogle = async (req, res) => {
    try {
        const { credential, remember_me } = req.body;
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Google credential token is required.',
            });
        }
        // Verify Google ID Token with Google's public tokeninfo endpoint
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        const googleUser = (await verifyRes.json());
        if (!verifyRes.ok || !googleUser.email) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired Google authentication credential.',
            });
        }
        const emailVerified = googleUser.email_verified === 'true' || googleUser.email_verified === true;
        if (!emailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Your Google email address must be verified by Google.',
            });
        }
        const user = await provisionGoogleUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0],
            picture: googleUser.picture,
            email_verified: true,
        });
        const remember = remember_me !== false;
        const token = signToken({ id: user.id, email: user.email, role: user.role }, remember);
        setAuthCookie(res, token, remember);
        return res.json({
            success: true,
            message: user.role === 'admin' ? 'Welcome back, Administrator Farah.' : 'Signed in with Google successfully.',
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
                is_verified: true,
            },
            redirectUrl: user.role === 'admin' ? '/admin' : '/account',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message || 'Google authentication failed.' });
    }
};
// --------------------------------------------------------
// 4. GOOGLE OAUTH REDIRECT (GET /api/auth/google/login)
// --------------------------------------------------------
export const googleAuthLogin = (req, res) => {
    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/google/callback`;
        const state = Buffer.from(JSON.stringify({
            redirect: req.query.redirect || '/account',
            rememberMe: req.query.remember !== '0',
        })).toString('base64');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'select_account',
            state,
        }).toString();
        return res.redirect(authUrl);
    }
    catch (err) {
        return res.redirect('/login?error=' + encodeURIComponent('Could not initiate Google sign in.'));
    }
};
// --------------------------------------------------------
// 5. GOOGLE OAUTH CALLBACK (GET /api/auth/google/callback)
// --------------------------------------------------------
export const googleAuthCallback = async (req, res) => {
    try {
        const { code, state, error } = req.query;
        if (error || !code) {
            return res.redirect('/login?error=' + encodeURIComponent(String(error || 'Google sign-in was cancelled.')));
        }
        let stateData = { redirect: '/account', rememberMe: true };
        try {
            if (state)
                stateData = JSON.parse(Buffer.from(String(state), 'base64').toString('utf8'));
        }
        catch { }
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const origin = `${protocol}://${host}`;
        const redirectUri = `${origin}/api/auth/google/callback`;
        // Exchange authorization code for Google access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: String(code),
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        const tokenData = (await tokenRes.json());
        if (!tokenRes.ok || !tokenData.id_token) {
            console.error('Google token exchange error:', tokenData);
            return res.redirect('/login?error=' + encodeURIComponent(tokenData.error_description || 'Google authentication failed.'));
        }
        // Verify token with tokeninfo
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenData.id_token}`);
        const googleUser = (await verifyRes.json());
        if (!verifyRes.ok || !googleUser.email) {
            return res.redirect('/login?error=' + encodeURIComponent('Invalid Google user data received.'));
        }
        const emailVerified = googleUser.email_verified === 'true' || googleUser.email_verified === true;
        if (!emailVerified) {
            return res.redirect('/login?error=' + encodeURIComponent('Unverified Google email address.'));
        }
        const user = await provisionGoogleUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            picture: googleUser.picture,
            email_verified: true,
        });
        const token = signToken({ id: user.id, email: user.email, role: user.role }, stateData.rememberMe);
        setAuthCookie(res, token, stateData.rememberMe);
        const targetUrl = (user.role === 'admin') ? '/admin' : (stateData.redirect || '/account');
        const separator = targetUrl.includes('?') ? '&' : '?';
        return res.redirect(`${targetUrl}${separator}auth_success=1&token=${encodeURIComponent(token)}`);
    }
    catch (err) {
        console.error('Google auth callback error:', err);
        return res.redirect('/login?error=' + encodeURIComponent(err.message || 'Authentication error.'));
    }
};
// --------------------------------------------------------
// 6. LOGOUT
// --------------------------------------------------------
export const logout = async (_req, res) => {
    clearAuthCookie(res);
    return res.json({
        success: true,
        message: 'Signed out successfully.',
    });
};
// --------------------------------------------------------
// 7. GET CURRENT AUTHENTICATED USER (ME)
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
        const isOwner = isAdminEmail(profile.email);
        const effectiveRole = isOwner ? 'admin' : (profile.role === 'admin' ? 'customer' : profile.role);
        return res.json({
            success: true,
            user: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
                role: effectiveRole,
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
// 8. FORGOT PASSWORD
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
// 9. RESET PASSWORD
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
// 10. VERIFY EMAIL
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
// 11. CHANGE PASSWORD (AUTHENTICATED)
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
// 12. DELETE ACCOUNT
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
        if (authRecord.role === 'admin' || isAdminEmail(req.user.email)) {
            return res.status(403).json({ success: false, message: 'Root administrator account cannot be self-deleted.' });
        }
        db.prepare('DELETE FROM user_addresses WHERE user_id = ?').run(req.user.id);
        db.prepare('DELETE FROM user_wishlists WHERE user_id = ?').run(req.user.id);
        db.prepare('DELETE FROM user_carts WHERE user_id = ?').run(req.user.id);
        db.prepare('DELETE FROM profiles WHERE id = ?').run(req.user.id);
        db.prepare('DELETE FROM auth_users WHERE id = ?').run(req.user.id);
        clearAuthCookie(res);
        return res.json({
            success: true,
            message: 'Your account and personal data have been completely removed.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
