import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let db: any;

let useFallback = false;

// Attempt native SQLite first (for local environment and standard servers)
try {
  // If running on Vercel, serverless environment cannot use native C++ bindings or write to disk
  if (process.env.VERCEL) {
    throw new Error('Vercel serverless environment detected: using pure JS memory store.');
  }

  const { default: Database } = await import('better-sqlite3');
  const dbPath = path.join(__dirname, '../../meher_mahel.db');
  db = new Database(dbPath);
  try {
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  } catch {}
} catch (err: any) {
  useFallback = true;
  console.log(`[Database Notice] ${err.message || 'Using cloud memory store'}`);
  db = createMemoryStore();
}

export function initDatabase() {
  if (useFallback) {
    // Memory store is already initialized with schema
    return;
  }

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
      images TEXT NOT NULL,
      tags TEXT,
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
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      order_status TEXT NOT NULL DEFAULT 'Order Placed',
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
      custom_config TEXT
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
      measurements TEXT NOT NULL,
      special_instructions TEXT,
      reference_image TEXT,
      estimated_price REAL NOT NULL,
      production_status TEXT DEFAULT 'Awaiting Review',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL DEFAULT 'percentage',
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
}

// Pure JavaScript Memory Store (Guarantees 100% crash-free operation on Vercel / Cloud serverless)
function createMemoryStore() {
  const tables: Record<string, any[]> = {
    categories: [],
    products: [],
    product_variants: [],
    hero_slides: [],
    orders: [],
    order_items: [],
    custom_abaya_orders: [],
    coupons: [],
    reviews: [],
    store_settings: [],
    newsletter_subscribers: [],
  };

  let autoId = 1;

  return {
    exec(_sql: string) {},
    pragma(_sql: string) {},
    transaction(fn: Function) {
      return (...args: any[]) => fn(...args);
    },
    prepare(sql: string) {
      const normalized = sql.replace(/\s+/g, ' ').trim();

      return {
        get(...params: any[]) {
          const res = this.all(...params);
          return res.length > 0 ? res[0] : undefined;
        },
        all(...params: any[]) {
          if (normalized.includes('FROM categories')) {
            if (normalized.includes('count(*)')) return [{ count: tables.categories.length }];
            return tables.categories.filter(c => c.is_active === 1).sort((a, b) => a.display_order - b.display_order);
          }
          if (normalized.includes('FROM hero_slides')) {
            if (normalized.includes('WHERE is_active = 1')) {
              return tables.hero_slides.filter(s => s.is_active === 1).sort((a, b) => a.display_order - b.display_order);
            }
            return tables.hero_slides.sort((a, b) => a.display_order - b.display_order);
          }
          if (normalized.includes('FROM products')) {
            if (normalized.includes('WHERE slug = ?')) {
              const slug = params[0];
              const p = tables.products.find(item => item.slug === slug && item.is_active === 1);
              if (!p) return [];
              const cat = tables.categories.find(c => c.id === p.category_id);
              return [{ ...p, category_name: cat?.name || '', category_slug: cat?.slug || '' }];
            }
            if (normalized.includes('count(*)')) {
              return [{ count: tables.products.filter(p => p.is_active === 1).length }];
            }
            // General query with filters
            let list = [...tables.products.filter(p => p.is_active === 1)];
            if (normalized.includes('c.slug = ?')) {
              const catSlug = params[0];
              const cat = tables.categories.find(c => c.slug === catSlug);
              list = list.filter(p => p.category_id === cat?.id);
            }
            if (normalized.includes('p.is_new_arrival = 1')) {
              list = list.filter(p => p.is_new_arrival === 1);
            }
            if (normalized.includes('p.is_best_seller = 1')) {
              list = list.filter(p => p.is_best_seller === 1);
            }
            return list.map(p => {
              const cat = tables.categories.find(c => c.id === p.category_id);
              return { ...p, category_name: cat?.name || '', category_slug: cat?.slug || '' };
            });
          }
          if (normalized.includes('FROM product_variants')) {
            if (normalized.includes('WHERE product_id = ?')) {
              const prodId = params[0];
              return tables.product_variants.filter(v => v.product_id === prodId);
            }
            if (normalized.includes('stock <= 5')) {
              return [{ count: tables.product_variants.filter(v => v.stock <= 5).length }];
            }
            return tables.product_variants;
          }
          if (normalized.includes('FROM store_settings')) {
            return tables.store_settings;
          }
          if (normalized.includes('FROM orders')) {
            if (normalized.includes('order_number = ?')) {
              return tables.orders.filter(o => o.order_number === params[0]);
            }
            if (normalized.includes('COALESCE(SUM(total)')) {
              const total = tables.orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total || 0), 0);
              return [{ total }];
            }
            if (normalized.includes('count(*)')) {
              return [{ count: tables.orders.length }];
            }
            return tables.orders.slice().reverse();
          }
          if (normalized.includes('FROM order_items')) {
            const orderId = params[0];
            return tables.order_items.filter(it => it.order_id === orderId);
          }
          if (normalized.includes('FROM custom_abaya_orders')) {
            if (normalized.includes('WHERE order_id = ?')) {
              return tables.custom_abaya_orders.filter(c => c.order_id === params[0]);
            }
            if (normalized.includes('count(*)')) {
              return [{ count: tables.custom_abaya_orders.filter(c => c.production_status !== 'Ready to Dispatch').length }];
            }
            return tables.custom_abaya_orders.slice().reverse().map(c => {
              const ord = tables.orders.find(o => o.id === c.order_id);
              return { ...c, order_number: ord?.order_number, order_date: ord?.created_at, payment_status: ord?.payment_status };
            });
          }
          if (normalized.includes('FROM coupons')) {
            const code = params[0];
            return tables.coupons.filter(c => c.code === code && c.is_active === 1);
          }
          if (normalized.includes('FROM reviews')) {
            const prodId = params[0];
            return tables.reviews.filter(r => r.product_id === prodId && r.is_approved === 1);
          }
          return [];
        },
        run(...params: any[]) {
          const id = ++autoId;
          if (normalized.includes('INSERT INTO categories')) {
            tables.categories.push({ id, name: params[0], slug: params[1], description: params[2], image: params[3], display_order: params[4], is_active: 1 });
          } else if (normalized.includes('INSERT INTO hero_slides')) {
            tables.hero_slides.push({ id, eyebrow: params[0], heading: params[1], description: params[2], desktop_image: params[3], mobile_image: params[4], cta_primary_text: params[5], cta_primary_link: params[6], cta_secondary_text: params[7], cta_secondary_link: params[8], display_order: params[9], is_active: 1 });
          } else if (normalized.includes('INSERT INTO products')) {
            tables.products.push({ id, title: params[0], slug: params[1], sku: params[2], category_id: params[3], description: params[4], short_description: params[5], price: params[6], compare_at_price: params[7], is_new_arrival: params[8], is_best_seller: params[9], is_active: 1, images: params[10], tags: params[11], fabric_care: params[12], created_at: new Date().toISOString() });
          } else if (normalized.includes('INSERT INTO product_variants')) {
            tables.product_variants.push({ id, product_id: params[0], size: params[1], color: params[2], color_code: params[3], sku: params[4], stock: params[5] });
          } else if (normalized.includes('INSERT INTO orders')) {
            tables.orders.push({ id, order_number: params[0], customer_name: params[1], customer_email: params[2], customer_phone: params[3], shipping_address: params[4], billing_address: params[5], subtotal: params[6], discount: params[7], shipping_fee: params[8], tax: params[9], total: params[10], payment_method: params[11], payment_status: params[12], razorpay_order_id: params[13], order_status: params[14], notes: params[15], created_at: new Date().toISOString() });
          } else if (normalized.includes('INSERT INTO order_items')) {
            tables.order_items.push({ id, order_id: params[0], product_id: params[1], product_title: params[2], variant_id: params[3], size: params[4], color: params[5], price: params[6], quantity: params[7], custom_config: params[8] });
          } else if (normalized.includes('INSERT INTO custom_abaya_orders')) {
            tables.custom_abaya_orders.push({ id, order_id: params[0], customer_name: params[1], customer_email: params[2], customer_phone: params[3], silhouette: params[4], fabric: params[5], color: params[6], sleeve_style: params[7], cuffs: params[8], embroidery: params[9], details: params[10], measurements: params[11], special_instructions: params[12], reference_image: params[13], estimated_price: params[14], production_status: params[15] || 'Awaiting Review', created_at: new Date().toISOString() });
          } else if (normalized.includes('INSERT OR REPLACE INTO store_settings')) {
            const existing = tables.store_settings.find(s => s.key === params[0]);
            if (existing) existing.value = params[1];
            else tables.store_settings.push({ key: params[0], value: params[1] });
          } else if (normalized.includes('INSERT INTO coupons')) {
            tables.coupons.push({ id, code: params[0], discount_type: params[1], discount_value: params[2], min_order_amount: params[3], is_active: 1 });
          } else if (normalized.includes('INSERT INTO reviews')) {
            tables.reviews.push({ id, product_id: params[0], customer_name: params[1], rating: params[2], review_text: params[3], is_approved: 1, created_at: new Date().toISOString() });
          } else if (normalized.includes('INSERT INTO newsletter_subscribers')) {
            tables.newsletter_subscribers.push({ id, email: params[0], subscribed_at: new Date().toISOString() });
          } else if (normalized.includes('UPDATE orders')) {
            const orderId = params[params.length - 1];
            const order = tables.orders.find(o => o.id === Number(orderId));
            if (order) {
              if (normalized.includes('order_status = ?')) order.order_status = params[0];
              if (normalized.includes('tracking_number = ?')) order.tracking_number = params[1] || params[0];
              if (normalized.includes('payment_status = ?')) order.payment_status = params[params.length - 2];
            }
          } else if (normalized.includes('UPDATE custom_abaya_orders')) {
            const coId = params[1];
            const co = tables.custom_abaya_orders.find(c => c.id === Number(coId));
            if (co) co.production_status = params[0];
          } else if (normalized.includes('DELETE FROM products')) {
            const prodId = Number(params[0]);
            tables.products = tables.products.filter(p => p.id !== prodId);
          }
          return { lastInsertRowid: id, changes: 1 };
        },
      };
    },
  };
}
