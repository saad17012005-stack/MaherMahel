import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel ? '/tmp/meher_mahel.db' : path.join(__dirname, '../../meher_mahel.db');
export const db = new Database(dbPath);

// Enable pragmas safely
try {
  if (!isVercel) {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');
} catch (e) {
  console.warn('[Database] Pragma setup warning:', e);
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sku TEXT UNIQUE,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      description TEXT,
      short_description TEXT,
      price REAL NOT NULL,
      compare_at_price REAL,
      is_new_arrival INTEGER DEFAULT 0,
      is_best_seller INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      images TEXT NOT NULL, -- JSON array of image URLs
      tags TEXT, -- JSON array of tag strings
      fabric_care TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      size TEXT NOT NULL,
      color TEXT NOT NULL,
      color_code TEXT,
      sku TEXT,
      stock INTEGER DEFAULT 10,
      price_override REAL
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eyebrow TEXT,
      heading TEXT NOT NULL,
      description TEXT,
      desktop_image TEXT NOT NULL,
      mobile_image TEXT,
      cta_primary_text TEXT,
      cta_primary_link TEXT,
      cta_secondary_text TEXT,
      cta_secondary_link TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      billing_address TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      shipping_fee REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'razorpay' | 'cod'
      payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      order_status TEXT NOT NULL DEFAULT 'Order Placed', -- 'Order Placed' | 'Payment Confirmed' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled'
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_title TEXT NOT NULL,
      variant_id INTEGER,
      size TEXT,
      color TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      custom_config TEXT -- JSON string with custom abaya measurements if applicable
    );

    CREATE TABLE IF NOT EXISTS custom_abaya_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      silhouette TEXT NOT NULL,
      fabric TEXT NOT NULL,
      color TEXT NOT NULL,
      sleeve_style TEXT,
      cuffs TEXT,
      embroidery TEXT,
      details TEXT,
      measurements TEXT NOT NULL, -- JSON string
      special_instructions TEXT,
      reference_image TEXT,
      estimated_price REAL NOT NULL,
      production_status TEXT DEFAULT 'Awaiting Review', -- 'Awaiting Review' | 'Pattern Cutting' | 'Stitching' | 'Quality Check' | 'Ready to Dispatch'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[Database] SQLite database tables initialized successfully.');
}
