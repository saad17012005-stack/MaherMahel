import crypto from 'node:crypto';
import { db } from '../database/db.js';
// Helper for address ID
const generateAddressId = () => `addr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
// --------------------------------------------------------
// 1. PROFILE
// --------------------------------------------------------
export const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.user.id);
        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }
        return res.json({
            success: true,
            profile: {
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
export const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { full_name, phone, avatar_url } = req.body;
        if (!full_name || !String(full_name).trim()) {
            return res.status(400).json({ success: false, message: 'Full name cannot be blank.' });
        }
        const cleanName = String(full_name).trim();
        const cleanPhone = phone ? String(phone).trim() : null;
        const cleanAvatar = avatar_url ? String(avatar_url).trim() : null;
        db.prepare(`
      UPDATE profiles
      SET full_name = ?, phone = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cleanName, cleanPhone, cleanAvatar, req.user.id);
        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            profile: {
                id: req.user.id,
                email: req.user.email,
                full_name: cleanName,
                phone: cleanPhone,
                avatar_url: cleanAvatar,
            },
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 2. USER ORDERS
// --------------------------------------------------------
export const getUserOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const orders = db.prepare(`
      SELECT * FROM orders
      WHERE user_id = ? OR customer_email = ?
      ORDER BY id DESC
    `).all(req.user.id, req.user.email);
        orders.forEach(order => {
            order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
        });
        return res.json({
            success: true,
            count: orders.length,
            orders,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 3. USER CUSTOM ABAYA COMMISSIONS
// --------------------------------------------------------
export const getUserCustomOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const customOrders = db.prepare(`
      SELECT * FROM custom_abaya_orders
      WHERE user_id = ? OR customer_email = ?
      ORDER BY id DESC
    `).all(req.user.id, req.user.email);
        customOrders.forEach(co => {
            try {
                co.measurements = typeof co.measurements === 'string' ? JSON.parse(co.measurements) : co.measurements;
            }
            catch { }
        });
        return res.json({
            success: true,
            count: customOrders.length,
            custom_orders: customOrders,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 4. SAVED ADDRESSES (Strict ownership enforcement)
// --------------------------------------------------------
export const getAddresses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const addresses = db.prepare(`
      SELECT * FROM user_addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, id DESC
    `).all(req.user.id);
        return res.json({ success: true, count: addresses.length, addresses });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const createAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { recipient_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default } = req.body;
        if (!recipient_name || !phone || !address_line_1 || !city || !state || !postal_code) {
            return res.status(400).json({
                success: false,
                message: 'Recipient name, phone, address line 1, city, state, and postal code are required.',
            });
        }
        const addrId = generateAddressId();
        const isDef = is_default ? 1 : 0;
        if (isDef === 1) {
            // Unset previous defaults for this user
            db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
        }
        db.prepare(`
      INSERT INTO user_addresses (id, user_id, recipient_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(addrId, req.user.id, recipient_name.trim(), phone.trim(), address_line_1.trim(), (address_line_2 || '').trim(), city.trim(), state.trim(), postal_code.trim(), (country || 'India').trim(), isDef);
        return res.status(201).json({
            success: true,
            message: 'Delivery address added successfully.',
            address_id: addrId,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const updateAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { id } = req.params;
        const { recipient_name, phone, address_line_1, address_line_2, city, state, postal_code, country, is_default } = req.body;
        // Verify ownership
        const existing = db.prepare('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?').get(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
        }
        const isDef = is_default ? 1 : 0;
        if (isDef === 1) {
            db.prepare('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
        }
        db.prepare(`
      UPDATE user_addresses
      SET recipient_name = ?, phone = ?, address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(recipient_name.trim(), phone.trim(), address_line_1.trim(), (address_line_2 || '').trim(), city.trim(), state.trim(), postal_code.trim(), (country || 'India').trim(), isDef, id, req.user.id);
        return res.json({ success: true, message: 'Address updated successfully.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { id } = req.params;
        // Verify ownership
        const existing = db.prepare('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?').get(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
        }
        db.prepare('DELETE FROM user_addresses WHERE id = ? AND user_id = ?').run(id, req.user.id);
        return res.json({ success: true, message: 'Address deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 5. WISHLIST
// --------------------------------------------------------
export const getWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const wishlistRows = db.prepare('SELECT product_id FROM user_wishlists WHERE user_id = ?').all(req.user.id);
        const productIds = wishlistRows.map(r => r.product_id);
        let products = [];
        if (productIds.length > 0) {
            products = productIds.map(pid => {
                const p = db.prepare('SELECT * FROM products WHERE id = ?').get(pid);
                if (!p)
                    return null;
                try {
                    p.images = JSON.parse(p.images);
                }
                catch { }
                return p;
            }).filter(Boolean);
        }
        return res.json({
            success: true,
            count: products.length,
            wishlist: products,
            product_ids: productIds,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const toggleWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { product_id } = req.body;
        if (!product_id) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }
        const existing = db.prepare('SELECT id FROM user_wishlists WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
        let inWishlist = false;
        if (existing) {
            db.prepare('DELETE FROM user_wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, product_id);
            inWishlist = false;
        }
        else {
            db.prepare('INSERT INTO user_wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
            inWishlist = true;
        }
        const countRow = db.prepare('SELECT count(*) as count FROM user_wishlists WHERE user_id = ?').get(req.user.id);
        return res.json({
            success: true,
            in_wishlist: inWishlist,
            count: countRow?.count || 0,
            message: inWishlist ? 'Saved to your Wishlist.' : 'Removed from your Wishlist.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const syncWishlist = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const userId = req.user.id;
        const { product_ids } = req.body;
        if (Array.isArray(product_ids)) {
            product_ids.forEach(pid => {
                try {
                    db.prepare('INSERT OR IGNORE INTO user_wishlists (user_id, product_id) VALUES (?, ?)').run(userId, pid);
                }
                catch { }
            });
        }
        const wishlistRows = db.prepare('SELECT product_id FROM user_wishlists WHERE user_id = ?').all(userId);
        return res.json({
            success: true,
            product_ids: wishlistRows.map(r => r.product_id),
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --------------------------------------------------------
// 5. USER PERSISTENT CART
// --------------------------------------------------------
export const getUserCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const row = db.prepare('SELECT cart_items FROM user_carts WHERE user_id = ?').get(req.user.id);
        let cart = [];
        if (row && row.cart_items) {
            try {
                cart = typeof row.cart_items === 'string' ? JSON.parse(row.cart_items) : row.cart_items;
            }
            catch { }
        }
        return res.json({
            success: true,
            cart,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const saveUserCart = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }
        const { cart } = req.body;
        const itemsJson = typeof cart === 'string' ? cart : JSON.stringify(cart || []);
        try {
            db.prepare(`
        INSERT INTO user_carts (user_id, cart_items, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET cart_items = excluded.cart_items, updated_at = CURRENT_TIMESTAMP
      `).run(req.user.id, itemsJson);
        }
        catch {
            // Fallback for engines without ON CONFLICT syntax
            const existing = db.prepare('SELECT user_id FROM user_carts WHERE user_id = ?').get(req.user.id);
            if (existing) {
                db.prepare('UPDATE user_carts SET cart_items = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(itemsJson, req.user.id);
            }
            else {
                db.prepare('INSERT INTO user_carts (user_id, cart_items, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)').run(req.user.id, itemsJson);
            }
        }
        return res.json({
            success: true,
            message: 'Shopping cart preserved in database.',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
