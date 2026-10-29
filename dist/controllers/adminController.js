import { db } from '../database/db.js';
export const getAdminStats = (_req, res) => {
    try {
        const totalRevenueRow = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid'").get();
        const totalOrdersRow = db.prepare('SELECT count(*) as count FROM orders').get();
        const pendingOrdersRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status IN ('Order Placed', 'Awaiting Payment', 'Payment Confirmed')").get();
        const customQueueRow = db.prepare("SELECT count(*) as count FROM custom_abaya_orders WHERE production_status != 'Ready to Dispatch'").get();
        const activeProductsRow = db.prepare('SELECT count(*) as count FROM products WHERE is_active = 1').get();
        const lowStockRow = db.prepare('SELECT count(*) as count FROM product_variants WHERE stock <= 5').get();
        const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_email, total, payment_status, order_status, created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 6
    `).all();
        res.json({
            success: true,
            stats: {
                total_revenue: totalRevenueRow.total,
                total_orders: totalOrdersRow.count,
                pending_orders: pendingOrdersRow.count,
                custom_queue_count: customQueueRow.count,
                active_products: activeProductsRow.count,
                low_stock_items: lowStockRow.count,
            },
            recent_orders: recentOrders,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getAdminOrders = (req, res) => {
    try {
        const { status, search } = req.query;
        let query = 'SELECT * FROM orders WHERE 1=1';
        const params = [];
        if (status && status !== 'all') {
            query += ' AND order_status = ?';
            params.push(status);
        }
        if (search) {
            query += ' AND (order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }
        query += ' ORDER BY id DESC';
        const orders = db.prepare(query).all(...params);
        orders.forEach(o => {
            o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
            o.custom_requests = db.prepare('SELECT * FROM custom_abaya_orders WHERE order_id = ?').all(o.id);
        });
        res.json({ success: true, count: orders.length, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateOrderStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { order_status, tracking_number, payment_status } = req.body;
        const fields = [];
        const params = [];
        if (order_status) {
            fields.push('order_status = ?');
            params.push(order_status);
        }
        if (tracking_number !== undefined) {
            fields.push('tracking_number = ?');
            params.push(tracking_number);
        }
        if (payment_status) {
            fields.push('payment_status = ?');
            params.push(payment_status);
        }
        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }
        params.push(id);
        const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
        db.prepare(sql).run(...params);
        res.json({ success: true, message: 'Order updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getCustomAbayaOrders = (_req, res) => {
    try {
        const orders = db.prepare(`
      SELECT c.*, o.order_number, o.created_at as order_date, o.payment_status
      FROM custom_abaya_orders c
      LEFT JOIN orders o ON c.order_id = o.id
      ORDER BY c.id DESC
    `).all();
        orders.forEach(o => {
            try {
                o.measurements = JSON.parse(o.measurements || '{}');
            }
            catch {
                o.measurements = {};
            }
        });
        res.json({ success: true, count: orders.length, orders });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateCustomOrderStatus = (req, res) => {
    try {
        const { id } = req.params;
        const { production_status } = req.body;
        if (!production_status) {
            return res.status(400).json({ success: false, message: 'production_status required.' });
        }
        db.prepare('UPDATE custom_abaya_orders SET production_status = ? WHERE id = ?').run(production_status, id);
        res.json({ success: true, message: 'Atelier production status updated.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const createProduct = (req, res) => {
    try {
        const { title, category_id, description, short_description, price, compare_at_price, is_new_arrival, is_best_seller, images, tags, fabric_care, variants, } = req.body;
        if (!title || !price || !category_id) {
            return res.status(400).json({ success: false, message: 'Title, category, and price are required.' });
        }
        // Generate unique slug
        let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
        const sku = `MM-${Date.now().toString().slice(-6)}`;
        const insertStmt = db.prepare(`
      INSERT INTO products (
        title, slug, sku, category_id, description, short_description,
        price, compare_at_price, is_new_arrival, is_best_seller, is_active,
        images, tags, fabric_care
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `);
        const result = insertStmt.run(title, slug, sku, category_id, description || '', short_description || '', Number(price), compare_at_price ? Number(compare_at_price) : null, is_new_arrival ? 1 : 0, is_best_seller ? 1 : 0, 1, JSON.stringify(Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop']), JSON.stringify(Array.isArray(tags) ? tags : []), fabric_care || '');
        const productId = result.lastInsertRowid;
        // Insert variants
        if (Array.isArray(variants) && variants.length > 0) {
            const insertVariantStmt = db.prepare(`
        INSERT INTO product_variants (product_id, size, color, color_code, sku, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
            variants.forEach((v) => {
                insertVariantStmt.run(productId, v.size || 'Standard', v.color || 'Standard', v.color_code || '#C88F91', `${sku}-${v.size || 'STD'}`, Number(v.stock) || 10);
            });
        }
        else {
            // Default standard variant
            db.prepare(`
        INSERT INTO product_variants (product_id, size, color, color_code, sku, stock)
        VALUES (?, 'Standard', 'Default', '#C88F91', ?, 15)
      `).run(productId, `${sku}-STD`);
        }
        res.status(201).json({ success: true, message: 'Product created successfully.', product_id: productId, slug });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateProduct = (req, res) => {
    try {
        const { id } = req.params;
        const { title, category_id, description, short_description, price, compare_at_price, is_new_arrival, is_best_seller, is_active, images, fabric_care, } = req.body;
        const updateStmt = db.prepare(`
      UPDATE products
      SET title = COALESCE(?, title),
          category_id = COALESCE(?, category_id),
          description = COALESCE(?, description),
          short_description = COALESCE(?, short_description),
          price = COALESCE(?, price),
          compare_at_price = ?,
          is_new_arrival = COALESCE(?, is_new_arrival),
          is_best_seller = COALESCE(?, is_best_seller),
          is_active = COALESCE(?, is_active),
          images = COALESCE(?, images),
          fabric_care = COALESCE(?, fabric_care)
      WHERE id = ?
    `);
        updateStmt.run(title, category_id, description, short_description, price ? Number(price) : null, compare_at_price ? Number(compare_at_price) : null, is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : null, is_best_seller !== undefined ? (is_best_seller ? 1 : 0) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, images ? JSON.stringify(images) : null, fabric_care, id);
        res.json({ success: true, message: 'Product updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const deleteProduct = (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
        res.json({ success: true, message: 'Product deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const getHeroSlidesAdmin = (_req, res) => {
    try {
        const slides = db.prepare('SELECT * FROM hero_slides ORDER BY display_order ASC, id ASC').all();
        res.json({ success: true, slides });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateHeroSlide = (req, res) => {
    try {
        const { id } = req.params;
        const { eyebrow, heading, description, desktop_image, mobile_image, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, display_order, is_active, } = req.body;
        db.prepare(`
      UPDATE hero_slides
      SET eyebrow = COALESCE(?, eyebrow),
          heading = COALESCE(?, heading),
          description = COALESCE(?, description),
          desktop_image = COALESCE(?, desktop_image),
          mobile_image = COALESCE(?, mobile_image),
          cta_primary_text = COALESCE(?, cta_primary_text),
          cta_primary_link = COALESCE(?, cta_primary_link),
          cta_secondary_text = COALESCE(?, cta_secondary_text),
          cta_secondary_link = COALESCE(?, cta_secondary_link),
          display_order = COALESCE(?, display_order),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(eyebrow, heading, description, desktop_image, mobile_image, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, display_order !== undefined ? Number(display_order) : null, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
        res.json({ success: true, message: 'Hero slide updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const updateStoreSettings = (req, res) => {
    try {
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ success: false, message: 'Settings object required.' });
        }
        const upsertStmt = db.prepare('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)');
        const upsertTx = db.transaction(() => {
            for (const [key, val] of Object.entries(settings)) {
                upsertStmt.run(key, String(val));
            }
        });
        upsertTx();
        res.json({ success: true, message: 'Store settings saved successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
