import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../database/db.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const logAdminAction = (adminId: string, adminEmail: string, action: string, recordType: string, recordId?: string, details?: any) => {
  try {
    db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, admin_email, action, record_type, record_id, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      adminEmail,
      action,
      recordType,
      recordId || null,
      details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
    );
  } catch (err: any) {
    console.warn('[Audit Log Warning]:', err.message);
  }
};

export const getAdminStats = (_req: Request, res: Response) => {
  try {
    const totalRevenueRow = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid'").get() as { total: number };
    const totalOrdersRow = db.prepare('SELECT count(*) as count FROM orders').get() as { count: number };
    const pendingOrdersRow = db.prepare("SELECT count(*) as count FROM orders WHERE order_status IN ('Order Placed', 'Awaiting Payment', 'Payment Confirmed')").get() as { count: number };
    const customQueueRow = db.prepare("SELECT count(*) as count FROM custom_abaya_orders WHERE production_status != 'Ready to Dispatch'").get() as { count: number };
    const activeProductsRow = db.prepare('SELECT count(*) as count FROM products WHERE is_active = 1').get() as { count: number };
    const lowStockRow = db.prepare('SELECT count(*) as count FROM product_variants WHERE stock <= 5').get() as { count: number };

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrders = (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

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

    const orders = db.prepare(query).all(...params) as any[];

    orders.forEach(o => {
      o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      o.custom_requests = db.prepare('SELECT * FROM custom_abaya_orders WHERE order_id = ?').all(o.id);
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order_status, tracking_number, payment_status } = req.body;

    const fields: string[] = [];
    const params: any[] = [];

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomAbayaOrders = (_req: Request, res: Response) => {
  try {
    const orders = db.prepare(`
      SELECT c.*, o.order_number, o.created_at as order_date, o.payment_status
      FROM custom_abaya_orders c
      LEFT JOIN orders o ON c.order_id = o.id
      ORDER BY c.id DESC
    `).all() as any[];

    orders.forEach(o => {
      try {
        o.measurements = JSON.parse(o.measurements || '{}');
      } catch {
        o.measurements = {};
      }
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomOrderStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { production_status } = req.body;

    if (!production_status) {
      return res.status(400).json({ success: false, message: 'production_status required.' });
    }

    db.prepare('UPDATE custom_abaya_orders SET production_status = ? WHERE id = ?').run(production_status, id);

    res.json({ success: true, message: 'Atelier production status updated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = (req: Request, res: Response) => {
  try {
    const {
      title,
      category_id,
      description,
      short_description,
      price,
      compare_at_price,
      is_new_arrival,
      is_best_seller,
      images,
      tags,
      fabric_care,
      variants,
    } = req.body;

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

    const result = insertStmt.run(
      title,
      slug,
      sku,
      category_id,
      description || '',
      short_description || '',
      Number(price),
      compare_at_price ? Number(compare_at_price) : null,
      is_new_arrival ? 1 : 0,
      is_best_seller ? 1 : 0,
      1,
      JSON.stringify(Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop']),
      JSON.stringify(Array.isArray(tags) ? tags : []),
      fabric_care || ''
    );

    const productId = result.lastInsertRowid;

    // Insert variants
    if (Array.isArray(variants) && variants.length > 0) {
      const insertVariantStmt = db.prepare(`
        INSERT INTO product_variants (product_id, size, color, color_code, sku, stock)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      variants.forEach((v: any) => {
        insertVariantStmt.run(
          productId,
          v.size || 'Standard',
          v.color || 'Standard',
          v.color_code || '#C88F91',
          `${sku}-${v.size || 'STD'}`,
          Number(v.stock) || 10
        );
      });
    } else {
      // Default standard variant
      db.prepare(`
        INSERT INTO product_variants (product_id, size, color, color_code, sku, stock)
        VALUES (?, 'Standard', 'Default', '#C88F91', ?, 15)
      `).run(productId, `${sku}-STD`);
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', product_id: productId, slug });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      category_id,
      description,
      short_description,
      price,
      compare_at_price,
      is_new_arrival,
      is_best_seller,
      is_active,
      images,
      fabric_care,
    } = req.body;

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

    updateStmt.run(
      title,
      category_id,
      description,
      short_description,
      price ? Number(price) : null,
      compare_at_price ? Number(compare_at_price) : null,
      is_new_arrival !== undefined ? (is_new_arrival ? 1 : 0) : null,
      is_best_seller !== undefined ? (is_best_seller ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      images ? JSON.stringify(images) : null,
      fabric_care,
      id
    );

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeroSlidesAdmin = (_req: Request, res: Response) => {
  try {
    const slides = db.prepare('SELECT * FROM hero_slides ORDER BY display_order ASC, id ASC').all();
    res.json({ success: true, slides });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHeroSlide = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      eyebrow,
      heading,
      description,
      desktop_image,
      mobile_image,
      cta_primary_text,
      cta_primary_link,
      cta_secondary_text,
      cta_secondary_link,
      display_order,
      is_active,
    } = req.body;

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
    `).run(
      eyebrow,
      heading,
      description,
      desktop_image,
      mobile_image,
      cta_primary_text,
      cta_primary_link,
      cta_secondary_text,
      cta_secondary_link,
      display_order !== undefined ? Number(display_order) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    res.json({ success: true, message: 'Hero slide updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------------
// USER MANAGEMENT CONTROLLERS
// --------------------------------------------------------

export const getAdminUsers = (req: Request, res: Response) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 20);

    let allUsers = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC').all() as any[];

    // Filters
    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      allUsers = allUsers.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }

    if (status && status !== 'all') {
      if (status === 'verified') allUsers = allUsers.filter(u => u.is_verified === 1);
      else if (status === 'unverified') allUsers = allUsers.filter(u => u.is_verified === 0);
      else if (status === 'suspended') allUsers = allUsers.filter(u => u.is_suspended === 1);
    }

    const totalCount = allUsers.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = allUsers.slice(startIndex, startIndex + limitNum);

    // Enrich with order counts and spent totals
    const enriched = paginated.map(user => {
      const orders = db.prepare(`
        SELECT total, payment_status
        FROM orders
        WHERE user_id = ? OR customer_email = ?
      `).all(user.id, user.email) as any[];

      const totalOrders = orders.length;
      const totalSpent = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_verified: Boolean(user.is_verified),
        is_suspended: Boolean(user.is_suspended),
        created_at: user.created_at,
        order_count: totalOrders,
        total_spent: totalSpent,
      };
    });

    res.json({
      success: true,
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(totalCount / limitNum),
      users: enriched,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUserDetails = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC').all(id) as any[];
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC').all(id, user.email) as any[];
    orders.forEach(o => {
      o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    });

    const customOrders = db.prepare('SELECT * FROM custom_abaya_orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC').all(id, user.email) as any[];
    customOrders.forEach(co => {
      try {
        co.measurements = typeof co.measurements === 'string' ? JSON.parse(co.measurements) : co.measurements;
      } catch {}
    });

    const auditLogs = db.prepare('SELECT * FROM admin_audit_logs WHERE record_id = ? ORDER BY created_at DESC').all(id) as any[];

    const totalSpent = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((s, o) => s + (o.total || 0), 0);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        is_verified: Boolean(user.is_verified),
        is_suspended: Boolean(user.is_suspended),
        created_at: user.created_at,
        total_orders: orders.length,
        total_spent: totalSpent,
      },
      addresses,
      orders,
      custom_orders: customOrders,
      audit_logs: auditLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminUser = (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { full_name, phone, avatar_url, is_verified } = req.body;

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedName = full_name ? String(full_name).trim() : user.full_name;
    const updatedPhone = phone !== undefined ? String(phone).trim() : user.phone;
    const updatedAvatar = avatar_url !== undefined ? avatar_url : user.avatar_url;
    const updatedVerified = is_verified !== undefined ? (is_verified ? 1 : 0) : user.is_verified;

    db.prepare(`
      UPDATE profiles
      SET full_name = ?, phone = ?, avatar_url = ?, is_verified = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updatedName, updatedPhone, updatedAvatar, updatedVerified, id);

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.email || 'admin@mehermahel.com',
      'UPDATE_USER_PROFILE',
      'USER',
      id,
      { updatedName, updatedPhone, updatedVerified }
    );

    res.json({ success: true, message: 'Customer profile updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suspendUser = (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Administrators cannot be suspended.' });
    }

    const newSuspension = user.is_suspended === 1 ? 0 : 1;

    db.prepare('UPDATE profiles SET is_suspended = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newSuspension, id);

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.email || 'admin@mehermahel.com',
      newSuspension === 1 ? 'SUSPEND_USER' : 'RESTORE_USER',
      'USER',
      id,
      { previousStatus: user.is_suspended, newStatus: newSuspension }
    );

    res.json({
      success: true,
      message: newSuspension === 1 ? 'Customer account has been suspended.' : 'Customer account has been restored.',
      is_suspended: Boolean(newSuspension),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const triggerPasswordReset = (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000).toISOString();

    db.prepare(`
      UPDATE auth_users
      SET reset_token = ?, reset_token_expires = ?
      WHERE id = ?
    `).run(resetToken, resetExpires, id);

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.email || 'admin@mehermahel.com',
      'TRIGGER_PASSWORD_RESET',
      'USER',
      id,
      { user_email: user.email }
    );

    res.json({
      success: true,
      message: 'Password reset link generated and dispatched.',
      reset_url: `/auth.html?mode=reset&token=${resetToken}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminUser = (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Root administrator cannot be deleted.' });
    }

    db.prepare('DELETE FROM user_addresses WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM user_wishlists WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
    db.prepare('DELETE FROM auth_users WHERE id = ?').run(id);

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.email || 'admin@mehermahel.com',
      'DELETE_USER_ACCOUNT',
      'USER',
      id,
      { deleted_email: user.email }
    );

    res.json({ success: true, message: 'Customer account and personal data deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportUserData = (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const addresses = db.prepare('SELECT * FROM user_addresses WHERE user_id = ?').all(id) as any[];
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? OR customer_email = ?').all(id, user.email) as any[];
    orders.forEach(o => {
      o.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    });
    const wishlists = db.prepare('SELECT * FROM user_wishlists WHERE user_id = ?').all(id) as any[];

    logAdminAction(
      req.user?.id || 'admin',
      req.user?.email || 'admin@mehermahel.com',
      'EXPORT_CUSTOMER_DATA',
      'USER',
      id
    );

    res.json({
      success: true,
      export_date: new Date().toISOString(),
      user,
      addresses,
      orders,
      wishlists,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = (_req: Request, res: Response) => {
  try {
    const logs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY id DESC LIMIT 100').all();
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
