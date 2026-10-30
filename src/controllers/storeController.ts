import type { Request, Response } from 'express';
import { db } from '../database/db.js';
import { createOrder as createRazorpayOrder } from '../services/paymentService.js';
import { isConfigured } from '../config/razorpay.js';

export const getStoreSettings = (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    res.json({
      success: true,
      settings,
      razorpay_configured: isConfigured(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = (_req: Request, res: Response) => {
  try {
    const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC').all();
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeroSlides = (_req: Request, res: Response) => {
  try {
    const slides = db.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC').all();
    res.json({ success: true, slides });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProducts = (req: Request, res: Response) => {
  try {
    const { category, is_new_arrival, is_best_seller, search, sort, min_price, max_price } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (is_new_arrival === 'true' || is_new_arrival === '1') {
      query += ` AND p.is_new_arrival = 1`;
    }

    if (is_best_seller === 'true' || is_best_seller === '1') {
      query += ` AND p.is_best_seller = 1`;
    }

    if (min_price) {
      query += ` AND p.price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ` AND p.price <= ?`;
      params.push(Number(max_price));
    }

    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'newest':
        query += ` ORDER BY p.created_at DESC`;
        break;
      default:
        query += ` ORDER BY p.id ASC`;
    }

    const products = db.prepare(query).all(...params) as any[];

    // Parse JSON fields safely
    products.forEach(p => {
      if (typeof p.images === 'string') {
        try {
          p.images = JSON.parse(p.images);
        } catch {
          p.images = p.images ? [p.images] : [];
        }
      } else if (!Array.isArray(p.images)) {
        p.images = [];
      }

      if (typeof p.tags === 'string') {
        try {
          p.tags = JSON.parse(p.tags);
        } catch {
          p.tags = [];
        }
      } else if (!Array.isArray(p.tags)) {
        p.tags = [];
      }

      // Fetch variants
      p.variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id);
    });

    res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlug = (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = db
      .prepare(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ? AND p.is_active = 1
      `)
      .get(slug) as any;

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (typeof product.images === 'string') {
      try {
        product.images = JSON.parse(product.images);
      } catch {
        product.images = product.images ? [product.images] : [];
      }
    } else if (!Array.isArray(product.images)) {
      product.images = [];
    }

    if (typeof product.tags === 'string') {
      try {
        product.tags = JSON.parse(product.tags);
      } catch {
        product.tags = [];
      }
    } else if (!Array.isArray(product.tags)) {
      product.tags = [];
    }
    product.variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
    product.reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC').all(product.id);

    // Fetch related products
    product.related = db
      .prepare('SELECT id, title, slug, price, compare_at_price, images FROM products WHERE category_id = ? AND id != ? AND is_active = 1 LIMIT 4')
      .all(product.category_id, product.id)
      .map((item: any) => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (Array.isArray(item.images) ? item.images : []),
      }));

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateCustomAbaya = (req: Request, res: Response) => {
  try {
    const { silhouette, fabric, details = [] } = req.body;

    let basePrice = 5500; // Base bespoke tailor craftsmanship

    const silhouetteRates: Record<string, number> = {
      'Closed Abaya': 0,
      'Open-Front Abaya': 300,
      'Butterfly Abaya': 600,
      'Kimono Abaya': 500,
    };

    const fabricRates: Record<string, number> = {
      'Premium Matte Crepe': 0,
      'Pure Silk Satin': 1800,
      'Korean Chiffon (Double Layer)': 900,
      'Silk-Blend Velvet': 2200,
      'Royal Nida': 600,
    };

    const detailRates: Record<string, number> = {
      'Pearl Drop Cuffs': 750,
      'Antique Gold Trim': 850,
      'Hand-Embroidered Hem': 1200,
      'Concealed Pockets': 350,
      'Detachable Fabric Belt': 400,
    };

    let additions = 0;
    if (silhouette && silhouetteRates[silhouette]) additions += silhouetteRates[silhouette];
    if (fabric && fabricRates[fabric]) additions += fabricRates[fabric];

    if (Array.isArray(details)) {
      details.forEach((d: string) => {
        if (detailRates[d]) additions += detailRates[d];
      });
    }

    const estimatedTotal = basePrice + additions;

    res.json({
      success: true,
      breakdown: {
        basePrice,
        additions,
        estimatedTotal,
        productionTime: '7-12 business days',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyCoupon = (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code required.' });
    }

    const coupon = db
      .prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1')
      .get(code.toUpperCase().trim()) as any;

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const orderAmount = Number(subtotal) || 0;
    if (orderAmount < coupon.min_order_amount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.min_order_amount}.`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((orderAmount * coupon.discount_value) / 100);
    } else {
      discount = Math.min(orderAmount, coupon.discount_value);
    }

    res.json({
      success: true,
      code: coupon.code,
      discount,
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStoreOrder = async (req: Request, res: Response) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      items,
      coupon_code,
      payment_method,
      utr_id,
      notes,
      user_id,
    } = req.body;

    const resolvedUserId = user_id || (req as any).user?.id || null;

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return res.status(400).json({ success: false, message: 'Missing required customer details.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      const price = Number(item.price) || 0;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      subtotal += price * quantity;
    }

    // Apply Coupon if valid
    let discount = 0;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code.toUpperCase()) as any;
      if (coupon && subtotal >= coupon.min_order_amount) {
        discount = coupon.discount_type === 'percentage'
          ? Math.round((subtotal * coupon.discount_value) / 100)
          : Math.min(subtotal, coupon.discount_value);
      }
    }

    // Calculate Shipping & Tax
    const settingsRows = db.prepare('SELECT key, value FROM store_settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    settingsRows.forEach(r => (settings[r.key] = r.value));

    const freeThreshold = Number(settings.free_shipping_threshold) || 5000;
    const flatRate = Number(settings.shipping_flat_rate) || 150;
    const shipping_fee = subtotal >= freeThreshold ? 0 : flatRate;

    const taxPercent = Number(settings.tax_percent) || 5;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * taxPercent) / 100);

    const total = taxableAmount + shipping_fee + tax;

    // Generate Order Number MM-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const order_number = `MM-${dateStr}-${randomSuffix}`;

    // Razorpay Integration
    let razorpay_order_id: string | null = null;
    let initialPaymentStatus = 'pending';

    if (payment_method === 'razorpay' && isConfigured()) {
      try {
        const rzpOrder = await createRazorpayOrder({
          amount: total,
          currency: settings.currency || 'INR',
          receipt: order_number,
          notes: {
            customer_name,
            customer_email,
            customer_phone,
            order_number,
          },
        });
        razorpay_order_id = rzpOrder.id;
      } catch (err: any) {
        console.warn('[Razorpay Order Note]: Key not configured or offline:', err.message);
      }
    }

    // Insert Order into SQLite in a single transaction
    const insertTransaction = db.transaction(() => {
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          shipping_address, billing_address, subtotal, discount,
          shipping_fee, tax, total, payment_method, payment_status,
          razorpay_order_id, utr_id, order_status, notes, user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const orderResult = insertOrderStmt.run(
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        typeof shipping_address === 'object' ? JSON.stringify(shipping_address) : shipping_address,
        billing_address ? (typeof billing_address === 'object' ? JSON.stringify(billing_address) : billing_address) : null,
        subtotal,
        discount,
        shipping_fee,
        tax,
        total,
        payment_method || 'upi_scanner',
        initialPaymentStatus,
        razorpay_order_id,
        utr_id || null,
        payment_method === 'cod' ? 'Order Placed' : (payment_method === 'upi_scanner' ? 'Payment Submitted (UTR Verification)' : 'Awaiting Payment'),
        notes || '',
        resolvedUserId
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert line items
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_title, variant_id, size, color, price, quantity, custom_config
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertCustomAbayaStmt = db.prepare(`
        INSERT INTO custom_abaya_orders (
          order_id, customer_name, customer_email, customer_phone,
          silhouette, fabric, color, sleeve_style, cuffs, embroidery, details,
          measurements, special_instructions, reference_image, estimated_price, production_status, user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Awaiting Review', ?)
      `);

      for (const item of items) {
        insertItemStmt.run(
          orderId,
          item.product_id || null,
          item.title || 'Bespoke Item',
          item.variant_id || null,
          item.size || 'Standard',
          item.color || 'Standard',
          item.price,
          item.quantity || 1,
          item.custom_config ? JSON.stringify(item.custom_config) : null
        );

        // If this item is a custom bespoke abaya, create entry in custom_abaya_orders queue!
        if (item.custom_config) {
          const cfg = item.custom_config;
          insertCustomAbayaStmt.run(
            orderId,
            customer_name,
            customer_email,
            customer_phone,
            cfg.silhouette || 'Custom Silhouette',
            cfg.fabric || 'Standard Crepe',
            cfg.color || 'Custom Color',
            cfg.sleeve_style || 'Bell Sleeve',
            cfg.cuffs || '',
            cfg.embroidery || '',
            cfg.details ? (Array.isArray(cfg.details) ? cfg.details.join(', ') : cfg.details) : '',
            JSON.stringify(cfg.measurements || {}),
            cfg.special_instructions || '',
            cfg.reference_image || null,
            item.price,
            resolvedUserId
          );
        }
      }

      return orderId;
    });

    const orderId = insertTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: {
        id: orderId,
        order_number,
        total,
        subtotal,
        discount,
        shipping_fee,
        tax,
        razorpay_order_id,
        payment_method,
      },
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to place order.' });
  }
};

export const trackOrder = (req: Request, res: Response) => {
  try {
    const rawOrderNumber = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;
    const orderNumber = rawOrderNumber?.trim() || '';
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;

    if (!order) {
      return res.status(404).json({ success: false, message: 'No order found with this reference number.' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);

    // Compute status timeline steps
    const steps = [
      { name: 'Order Placed', completed: true, timestamp: order.created_at },
      { name: 'Payment Confirmed', completed: order.payment_status === 'paid' || order.order_status !== 'Awaiting Payment' },
      { name: 'Processing / Atelier', completed: ['In Production', 'Shipped', 'Delivered'].includes(order.order_status) },
      { name: 'Dispatched / Courier', completed: ['Shipped', 'Delivered'].includes(order.order_status) },
      { name: 'Delivered', completed: order.order_status === 'Delivered' },
    ];

    res.json({
      success: true,
      order: {
        order_number: order.order_number,
        status: order.order_status,
        payment_status: order.payment_status,
        tracking_number: order.tracking_number,
        created_at: order.created_at,
        total: order.total,
        items,
        steps,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const subscribeNewsletter = (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address required.' });
    }

    try {
      db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email.toLowerCase().trim());
    } catch {
      // Ignore unique constraint duplicate email gracefully
    }

    res.json({
      success: true,
      message: 'Thank you for joining our circle. A private welcome note has been prepared for you.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
