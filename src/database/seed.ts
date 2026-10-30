import { db, initDatabase } from './db.js';

export function seedDatabase() {
  initDatabase();

  const countCategories = db.prepare('SELECT count(*) as count FROM categories').get() as { count: number };
  if (countCategories.count > 0) {
    console.log('[Seed] Database already seeded. Skipping initial seeding.');
    return;
  }

  console.log('[Seed] Seeding Meher Mahel luxury boutique catalog...');

  // 1. Insert Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, slug, description, image, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `);

  insertCategory.run(
    'Abayas',
    'abayas',
    'From everyday classics to occasion pieces, cut for comfort, movement, and a graceful drape.',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
    1
  );
  insertCategory.run(
    'Traditional Wear',
    'traditional-wear',
    'Beautiful dresses rooted in tradition, finished with modern artisanal detail for celebrations and everyday elegance.',
    '/images/products/traditional-blue-lace.jpg',
    2
  );
  insertCategory.run(
    'Handbags',
    'handbags',
    'Refined bags that complete your look, from everyday carry to heirloom evening pieces.',
    '/images/products/handbag-toile.jpg',
    3
  );
  insertCategory.run(
    'Watches',
    'watches',
    'Delicate timepieces designed for women who appreciate the subtle luxury of small details.',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=900&auto=format&fit=crop',
    4
  );

  // 2. Insert Hero Slides
  const insertSlide = db.prepare(`
    INSERT INTO hero_slides (eyebrow, heading, description, desktop_image, mobile_image, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertSlide.run(
    'THE MEHER MAHEL COLLECTION',
    'Elegance, Draped in Grace.',
    'Discover graceful abayas and thoughtfully curated pieces designed for the woman who appreciates timeless modest luxury.',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    'Shop Abayas',
    '#shop-section',
    'Explore Collection',
    '#categories-section',
    1
  );

  insertSlide.run(
    'BESPOKE ATELIER',
    'Your Style. Your Measurements. Your Abaya.',
    'Create an abaya that reflects your individuality, from the drape of silk crepe to delicate pearl and antique gold hand-finishes.',
    'https://images.unsplash.com/photo-1590507673164-6c6d319f9b84?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590507673164-6c6d319f9b84?q=80&w=1000&auto=format&fit=crop',
    'Design Your Abaya',
    '#custom-abaya-section',
    'View Size Guide',
    '#size-guide-modal',
    2
  );

  insertSlide.run(
    'THE FINISHING TOUCH',
    'Complete Your Elegance.',
    'Discover structured porcelain-inspired handbags, rose-gold timepieces, and accessories that bring every outfit together.',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=2000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=1000&auto=format&fit=crop',
    'Shop Handbags',
    '#shop-section',
    'Explore Watches',
    '#shop-section',
    3
  );

  // 3. Insert Products
  const insertProduct = db.prepare(`
    INSERT INTO products (title, slug, sku, category_id, description, short_description, price, compare_at_price, is_new_arrival, is_best_seller, is_active, images, tags, fabric_care)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, size, color, color_code, sku, stock, price_override)
    VALUES (?, ?, ?, ?, ?, ?, NULL)
  `);

  // Product 1: Noor Black Crepe Open-Front Abaya
  const p1 = insertProduct.run(
    'Noor Black Crepe Open-Front Abaya',
    'noor-black-crepe-open-front-abaya',
    'ABY-NOOR-01',
    1,
    'A flowing black crepe abaya with a clean open front, antique gold-toned button detail, and soft bell sleeves. Lightweight and breathable, it falls elegantly from shoulder to hem.',
    'Flowing open-front abaya with antique gold buttons and graceful bell sleeves.',
    4999,
    6499,
    1,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['abaya', 'crepe', 'open-front', 'gold-detail', 'eid']),
    'Fabric: Premium Matte Crepe. Care: Dry clean or hand wash cold inside out. Steam iron.'
  );

  ['52', '54', '56', '58', '60'].forEach(size => {
    insertVariant.run(p1.lastInsertRowid, size, 'Midnight Black', '#1A1A1A', `ABY-NOOR-${size}-BLK`, 15);
  });

  // Product 2: Zahra Rose Pearl Velvet Abaya
  const p2 = insertProduct.run(
    'Zahra Rose Pearl Velvet Abaya',
    'zahra-rose-pearl-velvet-abaya',
    'ABY-ZAHRA-02',
    1,
    'Luxurious dusty rose silk-velvet abaya detailed with genuine freshwater pearl tassels along the cuffs and neckline. Designed for celebration and special evenings.',
    'Dusty rose silk-velvet with delicate pearl droplet cuffs.',
    6499,
    7999,
    1,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['abaya', 'velvet', 'dusty-rose', 'pearls', 'luxury']),
    'Fabric: Silk-blend Velvet. Care: Professional dry clean only.'
  );

  ['52', '54', '56', '58'].forEach(size => {
    insertVariant.run(p2.lastInsertRowid, size, 'Dusty Rose', '#C88F91', `ABY-ZAHRA-${size}-ROSE`, 10);
  });

  // Product 3: Amani Kimono Butterfly Abaya
  const p3 = insertProduct.run(
    'Amani Kimono Butterfly Abaya',
    'amani-kimono-butterfly-abaya',
    'ABY-AMANI-03',
    1,
    'An ultra-comfortable batwing silhouette that provides supreme modesty and effortless movement. Finished in lightweight breathable georgette with subtle gold French seam stitching.',
    'Lightweight georgette butterfly cut with subtle gold topstitching.',
    5499,
    null,
    0,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['abaya', 'butterfly', 'kimono', 'modest']),
    'Fabric: Korean Georgette. Care: Gentle machine wash on delicate cycle.'
  );

  ['Free Size (54-58)'].forEach(size => {
    insertVariant.run(p3.lastInsertRowid, size, 'Champagne Ivory', '#FAF7F2', `ABY-AMANI-FS-IVY`, 20);
    insertVariant.run(p3.lastInsertRowid, size, 'Sage Green', '#A8D5BA', `ABY-AMANI-FS-SGE`, 12);
  });

  // Product 4: Ayla Pastel Blue Bell-Sleeve Lace Ensemble (User uploaded image!)
  const p4 = insertProduct.run(
    'Ayla Pastel Blue Bell-Sleeve Lace Set',
    'ayla-pastel-blue-bell-sleeve-lace-set',
    'TRD-AYLA-01',
    2,
    'Artisanal powder blue corded lace tunic with statement flared bell sleeves, square sweetheart neckline, and tailored straight-leg trousers. Paired effortlessly with ethnic silver jhumkas or clutch.',
    'Powder blue corded lace co-ord set with bell sleeves and matching pants.',
    7299,
    8999,
    1,
    1,
    JSON.stringify([
      '/images/products/traditional-blue-lace.jpg',
    ]),
    JSON.stringify(['traditional', 'lace', 'bell-sleeve', 'powder-blue', 'co-ord']),
    'Fabric: Corded French Lace with crepe silk lining. Care: Dry clean only.'
  );

  ['XS', 'S', 'M', 'L', 'XL'].forEach(size => {
    insertVariant.run(p4.lastInsertRowid, size, 'Powder Blue', '#B5D5E8', `TRD-AYLA-${size}-BLU`, 8);
  });

  // Product 5: Gulnar Antique Gold Brocade Kurta Set
  const p5 = insertProduct.run(
    'Gulnar Antique Gold Brocade Ensemble',
    'gulnar-antique-gold-brocade-ensemble',
    'TRD-GULNAR-02',
    2,
    'Heirloom banarasi woven silk kurta adorned with subtle antique zardozi work, paired with palazzo trousers and a sheer organza dupatta with scalloped borders.',
    'Woven silk brocade in antique gold with hand-finished organza dupatta.',
    8999,
    10999,
    1,
    0,
    JSON.stringify([
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['traditional', 'brocade', 'festive', 'wedding', 'antique-gold']),
    'Fabric: Pure Banarasi Silk. Care: Dry clean only.'
  );

  ['S', 'M', 'L', 'XL'].forEach(size => {
    insertVariant.run(p5.lastInsertRowid, size, 'Antique Gold', '#C6A15B', `TRD-GULNAR-${size}-GLD`, 10);
  });

  // Product 6: Toile de Jouy Structured Ribbon Handbag (User uploaded image!)
  const p6 = insertProduct.run(
    'Toile de Jouy Structured Ribbon Handbag',
    'toile-de-jouy-structured-ribbon-handbag',
    'BAG-TOILE-01',
    3,
    'A structured heritage silhouette crafted in woven ivory canvas with classic navy botanical Toile de Jouy tapestry embroidery. Crowned with a luxurious navy silk-satin bow twilly wrapped across the top handle and antique brass hardware.',
    'Ivory canvas with navy Toile tapestry embroidery and royal navy satin bow.',
    4499,
    5999,
    1,
    1,
    JSON.stringify([
      '/images/products/handbag-toile.jpg',
    ]),
    JSON.stringify(['handbag', 'toile-de-jouy', 'satin-ribbon', 'boutique', 'luxury']),
    'Material: Structured Tapestry Canvas, Vegan Leather Trim, Brass Clasp. Care: Spot clean with damp soft cloth.'
  );

  insertVariant.run(p6.lastInsertRowid, 'One Size', 'Navy & Ivory', '#1E3A8A', 'BAG-TOILE-OS', 18);

  // Product 7: Satin Pearl Evening Minaudière
  const p7 = insertProduct.run(
    'Satin Pearl Evening Minaudière',
    'satin-pearl-evening-minaudiere',
    'BAG-MINAUD-02',
    3,
    'Dainty hard-case clutch upholstered in shimmering dusty-rose duchess satin, framed in antique gold with a detachable pearl droplet shoulder chain.',
    'Dusty rose duchess satin clutch with gold frame and pearl chain.',
    3899,
    4699,
    0,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['handbag', 'clutch', 'evening', 'pearls', 'dusty-rose']),
    'Material: Duchess Satin & Brass Frame. Care: Keep in dust bag.'
  );

  insertVariant.run(p7.lastInsertRowid, 'One Size', 'Dusty Rose', '#C88F91', 'BAG-MINAUD-OS', 14);

  // Product 8: Heritage Rose Gold Mesh Watch
  const p8 = insertProduct.run(
    'Heritage Rose Gold Mesh Watch',
    'heritage-rose-gold-mesh-watch',
    'WTC-ROSE-01',
    4,
    'An ultra-slim 6mm profile engineered to slide comfortably under abaya sleeves without catching. Features an ivory enamel dial, rose gold Milanese magnetic strap, and Japanese quartz movement.',
    'Ultra-slim 6mm rose gold timepiece with Milanese mesh strap.',
    5299,
    6499,
    1,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['watch', 'rose-gold', 'mesh', 'slim', 'minimal']),
    'Case: 32mm Rose Gold Stainless Steel. Water Resistance: 3 ATM (Splash resistant).'
  );

  insertVariant.run(p8.lastInsertRowid, '32mm', 'Rose Gold', '#B76E79', 'WTC-ROSE-32MM', 25);

  // Product 9: Mother of Pearl Diamond Bezel Watch
  const p9 = insertProduct.run(
    'Mother of Pearl Diamond Bezel Watch',
    'mother-of-pearl-diamond-bezel-watch',
    'WTC-PEARL-02',
    4,
    'Captivating iridescent natural mother-of-pearl dial enclosed within an antique gold fluted bezel set with subtle crystal markers. Fitted with an interchangeable genuine leather strap in blush pink.',
    'Genuine mother-of-pearl face with antique gold fluted bezel.',
    6199,
    7500,
    0,
    1,
    JSON.stringify([
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop',
    ]),
    JSON.stringify(['watch', 'mother-of-pearl', 'gold', 'blush']),
    'Dial: Genuine White MOP. Movement: Swiss Quartz. Glass: Sapphire Coated.'
  );

  insertVariant.run(p9.lastInsertRowid, '34mm', 'Champagne & Blush', '#E4CC9A', 'WTC-PEARL-34MM', 15);

  // 4. Default Store Settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)');
  insertSetting.run('announcement_bar', '✨ Discover Timeless Modest Luxury — Free Custom Bespoke Consultations Available');
  insertSetting.run('currency', 'INR');
  insertSetting.run('whatsapp_number', '+91 76098 74187');
  insertSetting.run('upi_id', '7609874187@ibl');
  insertSetting.run('contact_email', 'concierge@mehermahel.com');
  insertSetting.run('shipping_flat_rate', '150');
  insertSetting.run('free_shipping_threshold', '5000');
  insertSetting.run('tax_percent', '5');
  insertSetting.run('custom_production_days', '7-12 business days');

  // 5. Default Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);
  insertCoupon.run('WELCOME10', 'percentage', 10, 2000);
  insertCoupon.run('ELEGANCE15', 'percentage', 15, 6000);

  // 6. Sample Verified Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, customer_name, rating, review_text, is_approved)
    VALUES (?, ?, ?, ?, 1)
  `);
  insertReview.run(1, 'Fatima Al-Sayed', 5, 'The fabric drape on the Noor abaya is breathtaking. The antique gold buttons have a subtle, premium weight to them.');
  insertReview.run(2, 'Aisha Khan', 5, 'The velvet is so soft, and the pearl cuffs made me feel like royalty on Eid. Worth every rupee.');
  insertReview.run(4, 'Mariam Siddiqui', 5, 'The corded lace bell sleeves are gorgeous in person. The sizing was exact.');
  insertReview.run(6, 'Zainab Qureshi', 5, 'The Toile de Jouy handbag with the satin bow is an absolute work of art. I received compliments all evening!');

  console.log('[Seed] Database successfully seeded with 9 luxury products, categories, hero slides, and boutique settings.');
}
