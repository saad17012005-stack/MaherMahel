// ========================================================
// MEHER MAHEL LUXURY BOUTIQUE E-COMMERCE ENGINE
// ========================================================

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'THE MEHER MAHEL COLLECTION',
    heading: 'Elegance, Draped in Grace.',
    description: 'Discover graceful abayas and thoughtfully curated pieces designed for the woman who appreciates timeless modest luxury.',
    desktop_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=2000&auto=format&fit=crop',
    mobile_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
    focal_position: 'center 20%',
    cta_primary_text: 'Shop Abayas',
    cta_primary_link: '#shop-section',
    cta_secondary_text: 'Explore Collection',
    cta_secondary_link: '#categories-section',
  },
  {
    id: 2,
    eyebrow: 'BESPOKE ATELIER',
    heading: 'Your Style. Your Measurements. Your Abaya.',
    description: 'Create an abaya that reflects your individuality, from the drape of silk crepe to delicate pearl and antique gold hand-finishes.',
    desktop_image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=2000&auto=format&fit=crop',
    mobile_image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=1000&auto=format&fit=crop',
    focal_position: 'center 30%',
    cta_primary_text: 'Design Your Abaya',
    cta_primary_link: '#custom-abaya-section',
    cta_secondary_text: 'View Size Guide',
    cta_secondary_link: '#size-guide-modal',
  },
  {
    id: 3,
    eyebrow: 'THE FINISHING TOUCH',
    heading: 'Complete Your Elegance.',
    description: 'Discover structured porcelain-inspired handbags, rose-gold timepieces, and accessories that bring every outfit together.',
    desktop_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2000&auto=format&fit=crop',
    mobile_image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop',
    focal_position: 'center center',
    cta_primary_text: 'Shop Handbags',
    cta_primary_link: '#shop-section',
    cta_secondary_text: 'Explore Watches',
    cta_secondary_link: '#shop-section',
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    title: 'Noor Black Crepe Open-Front Abaya',
    slug: 'noor-black-crepe-open-front-abaya',
    category_id: 1,
    category_name: 'Abayas',
    category_slug: 'abayas',
    price: 4999,
    compare_at_price: 6499,
    is_new_arrival: 1,
    is_best_seller: 1,
    short_description: 'Flowing open-front abaya with antique gold buttons and graceful bell sleeves.',
    description: 'A flowing black crepe abaya with a clean open front, antique gold-toned button detail, and soft bell sleeves. Lightweight and breathable, it falls elegantly from shoulder to hem.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Fabric: Premium Matte Crepe. Care: Dry clean or hand wash cold inside out. Steam iron.',
    tags: ['abaya', 'crepe', 'open-front', 'gold-detail', 'eid'],
    variants: [
      { id: 1, size: '52', color: 'Midnight Black' },
      { id: 2, size: '54', color: 'Midnight Black' },
      { id: 3, size: '56', color: 'Midnight Black' },
      { id: 4, size: '58', color: 'Midnight Black' },
      { id: 5, size: '60', color: 'Midnight Black' }
    ]
  },
  {
    id: 2,
    title: 'Zahra Rose Pearl Velvet Abaya',
    slug: 'zahra-rose-pearl-velvet-abaya',
    category_id: 1,
    category_name: 'Abayas',
    category_slug: 'abayas',
    price: 6499,
    compare_at_price: 7999,
    is_new_arrival: 1,
    is_best_seller: 1,
    short_description: 'Dusty rose silk-velvet with delicate pearl droplet cuffs.',
    description: 'Luxurious dusty rose silk-velvet abaya detailed with genuine freshwater pearl tassels along the cuffs and neckline. Designed for celebration and special evenings.',
    images: [
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=900&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Fabric: Silk-blend Velvet. Care: Professional dry clean only.',
    tags: ['abaya', 'velvet', 'dusty-rose', 'pearls', 'luxury'],
    variants: [
      { id: 6, size: '52', color: 'Dusty Rose' },
      { id: 7, size: '54', color: 'Dusty Rose' },
      { id: 8, size: '56', color: 'Dusty Rose' },
      { id: 9, size: '58', color: 'Dusty Rose' }
    ]
  },
  {
    id: 3,
    title: 'Amani Kimono Butterfly Abaya',
    slug: 'amani-kimono-butterfly-abaya',
    category_id: 1,
    category_name: 'Abayas',
    category_slug: 'abayas',
    price: 5499,
    compare_at_price: null,
    is_new_arrival: 0,
    is_best_seller: 1,
    short_description: 'Lightweight georgette butterfly cut with subtle gold topstitching.',
    description: 'An ultra-comfortable batwing silhouette that provides supreme modesty and effortless movement. Finished in lightweight breathable georgette with subtle gold French seam stitching.',
    images: [
      'https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Fabric: Korean Georgette. Care: Gentle machine wash on delicate cycle.',
    tags: ['abaya', 'butterfly', 'kimono', 'modest'],
    variants: [
      { id: 10, size: 'Free Size (54-58)', color: 'Champagne Ivory' },
      { id: 11, size: 'Free Size (54-58)', color: 'Sage Green' }
    ]
  },
  {
    id: 4,
    title: 'Ayla Pastel Blue Bell-Sleeve Lace Set',
    slug: 'ayla-pastel-blue-bell-sleeve-lace-set',
    category_id: 2,
    category_name: 'Traditional Wear',
    category_slug: 'traditional-wear',
    price: 7299,
    compare_at_price: 8999,
    is_new_arrival: 1,
    is_best_seller: 1,
    short_description: 'Powder blue corded lace co-ord set with bell sleeves and matching pants.',
    description: 'Artisanal powder blue corded lace tunic with statement flared bell sleeves, square sweetheart neckline, and tailored straight-leg trousers. Paired effortlessly with ethnic silver jhumkas or clutch.',
    images: [
      '/images/products/traditional-blue-lace.jpg'
    ],
    fabric_care: 'Fabric: Corded French Lace with crepe silk lining. Care: Dry clean only.',
    tags: ['traditional', 'lace', 'bell-sleeve', 'powder-blue', 'co-ord'],
    variants: [
      { id: 12, size: 'XS', color: 'Powder Blue' },
      { id: 13, size: 'S', color: 'Powder Blue' },
      { id: 14, size: 'M', color: 'Powder Blue' },
      { id: 15, size: 'L', color: 'Powder Blue' },
      { id: 16, size: 'XL', color: 'Powder Blue' }
    ]
  },
  {
    id: 5,
    title: 'Gulnar Antique Gold Brocade Ensemble',
    slug: 'gulnar-antique-gold-brocade-ensemble',
    category_id: 2,
    category_name: 'Traditional Wear',
    category_slug: 'traditional-wear',
    price: 8999,
    compare_at_price: 10999,
    is_new_arrival: 1,
    is_best_seller: 0,
    short_description: 'Woven silk brocade in antique gold with hand-finished organza dupatta.',
    description: 'Heirloom banarasi woven silk kurta adorned with subtle antique zardozi work, paired with palazzo trousers and a sheer organza dupatta with scalloped borders.',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Fabric: Pure Banarasi Silk. Care: Dry clean only.',
    tags: ['traditional', 'brocade', 'festive', 'wedding', 'antique-gold'],
    variants: [
      { id: 17, size: 'S', color: 'Antique Gold' },
      { id: 18, size: 'M', color: 'Antique Gold' },
      { id: 19, size: 'L', color: 'Antique Gold' },
      { id: 20, size: 'XL', color: 'Antique Gold' }
    ]
  },
  {
    id: 6,
    title: 'Toile de Jouy Structured Ribbon Handbag',
    slug: 'toile-de-jouy-structured-ribbon-handbag',
    category_id: 3,
    category_name: 'Handbags',
    category_slug: 'handbags',
    price: 4499,
    compare_at_price: 5999,
    is_new_arrival: 1,
    is_best_seller: 1,
    short_description: 'Ivory canvas with navy Toile tapestry embroidery and royal navy satin bow.',
    description: 'A structured heritage silhouette crafted in woven ivory canvas with classic navy botanical Toile de Jouy tapestry embroidery. Crowned with a luxurious navy silk-satin bow twilly wrapped across the top handle and antique brass hardware.',
    images: [
      '/images/products/handbag-toile.jpg'
    ],
    fabric_care: 'Material: Structured Tapestry Canvas, Vegan Leather Trim, Brass Clasp. Care: Spot clean with damp soft cloth.',
    tags: ['handbag', 'toile-de-jouy', 'satin-ribbon', 'boutique', 'luxury'],
    variants: [
      { id: 21, size: 'One Size', color: 'Navy & Ivory' }
    ]
  },
  {
    id: 7,
    title: 'Satin Pearl Evening Minaudière',
    slug: 'satin-pearl-evening-minaudiere',
    category_id: 3,
    category_name: 'Handbags',
    category_slug: 'handbags',
    price: 3899,
    compare_at_price: 4699,
    is_new_arrival: 0,
    is_best_seller: 1,
    short_description: 'Dusty rose duchess satin clutch with gold frame and pearl chain.',
    description: 'Dainty hard-case clutch upholstered in shimmering dusty-rose duchess satin, framed in antique gold with a detachable pearl droplet shoulder chain.',
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Material: Duchess Satin & Brass Frame. Care: Keep in dust bag.',
    tags: ['handbag', 'clutch', 'evening', 'pearls', 'dusty-rose'],
    variants: [
      { id: 22, size: 'One Size', color: 'Dusty Rose' }
    ]
  },
  {
    id: 8,
    title: 'Heritage Rose Gold Mesh Watch',
    slug: 'heritage-rose-gold-mesh-watch',
    category_id: 4,
    category_name: 'Watches',
    category_slug: 'watches',
    price: 5299,
    compare_at_price: 6499,
    is_new_arrival: 1,
    is_best_seller: 1,
    short_description: 'Ultra-slim 6mm rose gold timepiece with Milanese mesh strap.',
    description: 'An ultra-slim 6mm profile engineered to slide comfortably under abaya sleeves without catching. Features an ivory enamel dial, rose gold Milanese magnetic strap, and Japanese quartz movement.',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Case: 32mm Rose Gold Stainless Steel. Water Resistance: 3 ATM (Splash resistant).',
    tags: ['watch', 'rose-gold', 'mesh', 'slim', 'minimal'],
    variants: [
      { id: 23, size: '32mm', color: 'Rose Gold' }
    ]
  },
  {
    id: 9,
    title: 'Mother of Pearl Diamond Bezel Watch',
    slug: 'mother-of-pearl-diamond-bezel-watch',
    category_id: 4,
    category_name: 'Watches',
    category_slug: 'watches',
    price: 6199,
    compare_at_price: 7500,
    is_new_arrival: 0,
    is_best_seller: 1,
    short_description: 'Genuine mother-of-pearl face with antique gold fluted bezel.',
    description: 'Captivating iridescent natural mother-of-pearl dial enclosed within an antique gold fluted bezel set with subtle crystal markers. Fitted with an interchangeable genuine leather strap in blush pink.',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop'
    ],
    fabric_care: 'Dial: Genuine White MOP. Movement: Swiss Quartz. Glass: Sapphire Coated.',
    tags: ['watch', 'mother-of-pearl', 'gold', 'blush'],
    variants: [
      { id: 24, size: '34mm', color: 'Champagne & Blush' }
    ]
  }
];

let state = {
  products: [...DEFAULT_PRODUCTS],
  categories: [],
  heroSlides: [...DEFAULT_HERO_SLIDES],
  settings: {
    announcement_bar: '✨ Discover Timeless Modest Luxury — Free Custom Bespoke Consultations Available',
    currency: 'INR',
    whatsapp_number: '+919876543210',
    shipping_flat_rate: '150',
    free_shipping_threshold: '5000',
  },
  cart: JSON.parse(localStorage.getItem('mm_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('mm_wishlist') || '[]'),
  currentSlideIndex: 0,
  heroTimer: null,
  activeCategory: 'all',
  appliedCoupon: null,
  customWizardStep: 1,
};

// Initialize Application (Instant rendering with zero delay, followed by live background hydration)
document.addEventListener('DOMContentLoaded', () => {
  const y1 = document.getElementById('year');
  if (y1) y1.textContent = new Date().getFullYear();
  const y2 = document.getElementById('footerYear');
  if (y2) y2.textContent = new Date().getFullYear();

  // 1. Instant UI Render (Zero delay, works immediately on any network)
  renderHeroSlides();
  startHeroAutoplay();
  renderProducts(state.products);
  updateCartUI();
  updateWishlistUI();
  setupEventListeners();

  // 2. Parallel Background Hydration from API/Database
  Promise.allSettled([
    loadSettings(),
    loadHeroSlides(),
    loadProducts('all'),
  ]).catch(err => console.debug('Background hydration notice:', err));
});

// Load Settings from API
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      state.settings = data.settings;
      if (data.settings.announcement_bar) {
        const annEl = document.getElementById('announcementText');
        if (annEl) annEl.textContent = data.settings.announcement_bar;
      }
      if (data.settings.whatsapp_number) {
        const waBtn = document.getElementById('whatsappFloatBtn');
        if (waBtn) {
          const cleanNum = data.settings.whatsapp_number.replace(/[^0-9]/g, '');
          waBtn.href = `https://wa.me/${cleanNum}?text=Hi%20Meher%20Mahel%2C%20I%20have%20an%20inquiry%20regarding%20your%20luxury%20collection.`;
        }
      }
    }
  } catch (err) {
    console.warn('Could not load settings:', err);
  }
}

// --------------------------------------------------------
// 1. HERO CAROUSEL CONTROLLER
// --------------------------------------------------------
async function loadHeroSlides() {
  try {
    const res = await fetch('/api/hero-slides');
    const data = await res.json();
    if (data.success && data.slides.length > 0) {
      state.heroSlides = data.slides;
      renderHeroSlides();
      startHeroAutoplay();
    }
  } catch (err) {
    console.warn('Failed to load hero slides:', err);
  }
}

function renderHeroSlides() {
  const container = document.getElementById('heroSlidesContainer');
  const dotsContainer = document.getElementById('heroDots');
  if (!container || !dotsContainer) return;

  container.innerHTML = '';
  dotsContainer.innerHTML = '';

  state.heroSlides.forEach((slide, idx) => {
    const slideEl = document.createElement('div');
    slideEl.className = `hero-slide ${idx === 0 ? 'active' : ''}`;
    const focalPos = slide.focal_position || (idx === 0 ? 'center 20%' : (idx === 1 ? 'center 30%' : 'center center'));
    slideEl.innerHTML = `
      <picture class="w-full h-full block">
        <source media="(max-width: 640px)" srcset="${slide.mobile_image || slide.desktop_image}">
        <img src="${slide.desktop_image}" alt="${slide.heading}" class="hero-image w-full h-full object-cover" style="object-position: ${focalPos};">
      </picture>
      <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-charcoal/25"></div>
      <div class="absolute inset-0 flex items-center justify-center text-center p-6 sm:p-8">
        <div class="max-w-2xl text-white">
          <span class="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-champagneGold font-semibold mb-3 block drop-shadow-sm">${slide.eyebrow || 'MEHER MAHEL ATELIER'}</span>
          <h1 class="font-serif text-3xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-tight drop-shadow-md">${slide.heading}</h1>
          <p class="text-xs sm:text-sm md:text-base text-ivory/95 font-light mb-8 max-w-lg mx-auto leading-relaxed drop-shadow">${slide.description || ''}</p>
          <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            ${slide.cta_primary_text ? `
              <a href="${slide.cta_primary_link || '#shop-section'}" class="bg-dustyRose hover:bg-deepRose text-white text-[11px] sm:text-xs uppercase tracking-widest font-semibold px-7 sm:px-8 py-3.5 rounded-full transition-all shadow-xl shadow-dustyRose/30 gold-sheen-hover active:scale-95">
                ${slide.cta_primary_text}
              </a>
            ` : ''}
            ${slide.cta_secondary_text ? `
              <button onclick="handleSlideSecondaryCTA('${slide.cta_secondary_link}')" class="border border-white/80 hover:bg-white hover:text-charcoal text-white text-[11px] sm:text-xs uppercase tracking-widest font-semibold px-7 sm:px-8 py-3.5 rounded-full transition-all backdrop-blur-sm active:scale-95">
                ${slide.cta_secondary_text}
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    container.appendChild(slideEl);

    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
    dot.className = `w-2.5 h-2.5 rounded-full transition-all ${idx === 0 ? 'bg-champagneGold w-8' : 'bg-white/40 hover:bg-white'}`;
    dot.onclick = () => goToHeroSlide(idx);
    dotsContainer.appendChild(dot);
  });
}

function handleSlideSecondaryCTA(link) {
  if (link === '#custom-abaya-section' || link === '/custom-abaya') {
    openCustomAbayaModal();
  } else if (link === '#size-guide-modal') {
    openSizeGuideModal();
  } else {
    window.location.hash = link || 'shop-section';
  }
}

function startHeroAutoplay() {
  stopHeroAutoplay();
  state.heroTimer = setInterval(() => {
    nextHeroSlide();
  }, 5500);
}

function stopHeroAutoplay() {
  if (state.heroTimer) {
    clearInterval(state.heroTimer);
    state.heroTimer = null;
  }
}

function goToHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#heroDots button');
  if (slides.length === 0) return;

  slides.forEach((s, idx) => {
    s.classList.toggle('active', idx === index);
  });

  dots.forEach((d, idx) => {
    if (idx === index) {
      d.className = 'w-8 h-2.5 rounded-full bg-champagneGold transition-all';
    } else {
      d.className = 'w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white transition-all';
    }
  });

  state.currentSlideIndex = index;
}

function nextHeroSlide() {
  const total = state.heroSlides.length;
  if (total === 0) return;
  const next = (state.currentSlideIndex + 1) % total;
  goToHeroSlide(next);
}

function prevHeroSlide() {
  const total = state.heroSlides.length;
  if (total === 0) return;
  const prev = (state.currentSlideIndex - 1 + total) % total;
  goToHeroSlide(prev);
}

// --------------------------------------------------------
// 2. PRODUCT CATALOG & FILTERS
// --------------------------------------------------------
async function loadProducts(category = 'all') {
  try {
    state.activeCategory = category;
    const url = category && category !== 'all' ? `/api/products?category=${category}` : '/api/products';
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      state.products = data.products;
      renderProducts(data.products);
    }
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-mutedText">
        <p class="font-serif text-2xl text-charcoal mb-2">No pieces found in this category.</p>
        <button onclick="filterCategory('all')" class="text-xs uppercase tracking-wider font-semibold text-dustyRose underline mt-2">View All Pieces</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    const isWishlisted = state.wishlist.includes(product.id);
    const firstImg = product.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop';
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

    return `
      <div class="group relative bg-white rounded-2xl overflow-hidden border border-subtleBorder shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
        <!-- Image & Badges -->
        <div class="relative aspect-[3/4] bg-ivory overflow-hidden cursor-pointer" onclick="quickViewProduct('${product.slug}')">
          <img src="${firstImg}" alt="${product.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1">
            ${product.is_new_arrival ? `<span class="bg-charcoal text-champagneGold text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">New</span>` : ''}
            ${hasDiscount ? `<span class="bg-dustyRose text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Sale</span>` : ''}
          </div>

          <!-- Wishlist Heart Button -->
          <button onclick="toggleWishlist(${product.id}, event)" aria-label="Save to Wishlist" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-subtleBorder flex items-center justify-center text-charcoal hover:text-dustyRose transition-transform active:scale-90">
            <svg class="w-4 h-4 ${isWishlisted ? 'fill-dustyRose text-dustyRose' : 'fill-none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </button>
        </div>

        <!-- Details -->
        <div class="p-4 flex flex-col flex-grow justify-between">
          <div>
            <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider block mb-1">${product.category_name || 'Boutique Collection'}</span>
            <h3 onclick="quickViewProduct('${product.slug}')" class="font-serif text-base font-bold text-charcoal hover:text-dustyRose transition-colors line-clamp-1 cursor-pointer">
              ${product.title}
            </h3>
            <p class="text-xs text-mutedText line-clamp-1 mt-1 font-light">${product.short_description || ''}</p>
          </div>

          <div class="mt-4 pt-3 border-t border-subtleBorder flex items-center justify-between">
            <div>
              <span class="font-semibold text-sm text-charcoal">₹${product.price.toLocaleString()}</span>
              ${hasDiscount ? `<span class="text-[11px] text-mutedText line-through ml-1.5">₹${product.compare_at_price.toLocaleString()}</span>` : ''}
            </div>
            
            <button onclick="quickAddProduct(${product.id})" class="text-[11px] uppercase tracking-wider font-semibold text-dustyRose hover:text-deepRose border border-dustyRose/40 hover:border-dustyRose px-3 py-1.5 rounded-lg transition-all">
              + Bag
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(slug) {
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(slug.replace('-', ' ')));
    if (slug === 'all' && btn.textContent.toLowerCase() === 'all') btn.classList.add('active');
  });

  const titles = {
    'all': 'Complete Boutique Catalog',
    'abayas': 'Abayas Collection',
    'traditional-wear': 'Traditional Wear & Ensembles',
    'handbags': 'Boutique Handbags & Clutches',
    'watches': 'Heirloom Timepieces',
  };
  const titleEl = document.getElementById('catalogTitle');
  if (titleEl) titleEl.textContent = titles[slug] || 'Curated Collection';

  // Instant local filtering
  state.activeCategory = slug;
  const filtered = slug === 'all' 
    ? state.products 
    : state.products.filter(p => p.category_slug === slug || (p.category_name && p.category_name.toLowerCase().includes(slug.replace('-', ' '))));
  renderProducts(filtered);

  loadProducts(slug);

  const shopSec = document.getElementById('shop-section');
  if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
}

function filterByTag(tag) {
  if (tag === 'new_arrival') {
    const filtered = state.products.filter(p => p.is_new_arrival);
    renderProducts(filtered);
  } else if (tag === 'best_seller') {
    const filtered = state.products.filter(p => p.is_best_seller);
    renderProducts(filtered);
  }
}

// --------------------------------------------------------
// 3. PRODUCT QUICK-VIEW MODAL
// --------------------------------------------------------
async function quickViewProduct(slug) {
  try {
    let p = state.products.find(item => item.slug === slug);
    try {
      const res = await fetch(`/api/products/${slug}`);
      const data = await res.json();
      if (data.success && data.product) {
        p = data.product;
      }
    } catch (err) {
      console.debug('API lookup note:', err);
    }

    if (!p) return;

    const modal = document.getElementById('quickViewModal');
    const content = document.getElementById('quickViewContent');
    if (!modal || !content) return;

    const mainImg = p.images?.[0] || '';
    const variants = p.variants || [];

    content.innerHTML = `
      <div class="space-y-3">
        <div class="aspect-[3/4] bg-ivory rounded-2xl overflow-hidden border border-subtleBorder">
          <img id="qvMainImg" src="${mainImg}" alt="${p.title}" class="w-full h-full object-cover">
        </div>
        ${p.images?.length > 1 ? `
          <div class="flex gap-2 overflow-x-auto pb-1">
            ${p.images.map((img, i) => `
              <img src="${img}" alt="" onclick="document.getElementById('qvMainImg').src='${img}'" class="w-16 h-20 object-cover rounded-lg border border-subtleBorder cursor-pointer hover:border-dustyRose">
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="flex flex-col justify-between h-full">
        <div>
          <span class="text-xs uppercase tracking-[0.2em] text-antiqueGold font-bold">${p.category_name}</span>
          <h2 class="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-1 mb-2">${p.title}</h2>
          
          <div class="flex items-center gap-3 mb-4">
            <span class="text-xl font-bold text-charcoal">₹${p.price.toLocaleString()}</span>
            ${p.compare_at_price ? `<span class="text-sm text-mutedText line-through">₹${p.compare_at_price.toLocaleString()}</span>` : ''}
          </div>

          <p class="text-xs text-mutedText leading-relaxed mb-6 font-light">${p.description}</p>

          ${p.fabric_care ? `
            <div class="p-3 bg-ivory rounded-xl border border-subtleBorder text-xs text-mutedText mb-6">
              <span class="font-semibold text-charcoal block mb-0.5">Fabric & Care:</span>
              ${p.fabric_care}
            </div>
          ` : ''}

          <!-- Size Selector -->
          ${variants.length > 0 ? `
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-xs font-semibold uppercase text-charcoal">Select Size / Fit</label>
                <button type="button" onclick="openSizeGuideModal()" class="text-[11px] text-dustyRose underline">Size Guide</button>
              </div>
              <div class="flex flex-wrap gap-2" id="qvSizeOptions">
                ${variants.map((v, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="qvVariant" value="${v.id}" data-size="${v.size}" data-color="${v.color}" ${i === 0 ? 'checked' : ''} class="hidden peer">
                    <span class="px-3.5 py-1.5 rounded-lg border border-subtleBorder text-xs font-medium peer-checked:border-dustyRose peer-checked:bg-dustyRose/10 peer-checked:text-dustyRose block">
                      ${v.size}
                    </span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="pt-6 border-t border-subtleBorder space-y-3">
          <button onclick="handleQuickViewAddToCart(${p.id}, '${p.title}', ${p.price}, '${mainImg}')" class="w-full bg-dustyRose hover:bg-deepRose text-white font-semibold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-md gold-sheen-hover">
            Add to Shopping Bag
          </button>

          <a href="https://wa.me/919876543210?text=Hi%20Meher%20Mahel%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(p.title)}%20(SKU:%20${p.sku})." target="_blank" class="w-full border border-subtleBorder hover:border-dustyRose text-charcoal py-3 rounded-xl uppercase tracking-wider text-xs font-semibold transition-colors flex items-center justify-center gap-2">
            <span>WhatsApp Atelier Inquiry</span>
          </a>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Error viewing product:', err);
  }
}

function closeQuickViewModal() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.classList.add('hidden');
}

function handleQuickViewAddToCart(productId, title, price, image) {
  const selectedVariant = document.querySelector('input[name="qvVariant"]:checked');
  const size = selectedVariant ? selectedVariant.getAttribute('data-size') : 'Standard';
  const color = selectedVariant ? selectedVariant.getAttribute('data-color') : 'Standard';
  const variantId = selectedVariant ? Number(selectedVariant.value) : null;

  addToCart({
    product_id: productId,
    variant_id: variantId,
    title,
    price,
    image,
    size,
    color,
    quantity: 1,
  });

  closeQuickViewModal();
  openCartDrawer();
}

function quickAddProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const defaultVariant = product.variants?.[0];
  addToCart({
    product_id: product.id,
    variant_id: defaultVariant?.id || null,
    title: product.title,
    price: product.price,
    image: product.images?.[0] || '',
    size: defaultVariant?.size || 'Standard',
    color: defaultVariant?.color || 'Standard',
    quantity: 1,
  });

  openCartDrawer();
}

// --------------------------------------------------------
// 4. CART DRAWER MANAGEMENT
// --------------------------------------------------------
function addToCart(item) {
  const existing = state.cart.find(i => 
    i.product_id === item.product_id && 
    i.size === item.size && 
    i.color === item.color &&
    !i.custom_config
  );

  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
    state.cart.push({ ...item, id: Date.now() });
  }

  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('mm_cart', JSON.stringify(state.cart));
}

function updateCartQuantity(cartItemId, delta) {
  const item = state.cart.find(i => i.id === cartItemId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      saveCart();
      updateCartUI();
    }
  }
}

function removeFromCart(cartItemId) {
  state.cart = state.cart.filter(i => i.id !== cartItemId);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const countEls = [document.getElementById('cartCount'), document.getElementById('cartDrawerItemCount')];
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  countEls.forEach(el => { if (el) el.textContent = totalItems; });

  const listEl = document.getElementById('cartItemsList');
  if (!listEl) return;

  if (state.cart.length === 0) {
    listEl.innerHTML = `<div class="py-16 text-center text-mutedText text-xs font-light">Your shopping bag is empty.</div>`;
    document.getElementById('cartSubtotal').textContent = '₹0';
    document.getElementById('cartShipping').textContent = '₹0';
    document.getElementById('cartTotal').textContent = '₹0';
    return;
  }

  listEl.innerHTML = state.cart.map(item => `
    <div class="py-3 flex gap-3.5 items-start">
      <img src="${item.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=200&auto=format&fit=crop'}" alt="${item.title}" class="w-16 h-20 object-cover rounded-xl border border-subtleBorder shrink-0 bg-ivory">
      <div class="flex-grow">
        <h4 class="font-serif text-sm font-bold text-charcoal line-clamp-1">${item.title}</h4>
        <div class="text-[10px] text-mutedText mt-0.5 space-y-0.5">
          <p>Size: <span class="font-semibold text-charcoal">${item.size}</span> | Color: <span class="font-semibold text-charcoal">${item.color}</span></p>
          ${item.custom_config ? `
            <p class="text-deepRose font-semibold">Bespoke Atelier Measurements Included</p>
          ` : ''}
        </div>
        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center border border-subtleBorder rounded-lg overflow-hidden text-xs">
            <button onclick="updateCartQuantity(${item.id}, -1)" class="px-2.5 py-1 hover:bg-ivory">-</button>
            <span class="px-2 py-1 font-semibold">${item.quantity}</span>
            <button onclick="updateCartQuantity(${item.id}, 1)" class="px-2.5 py-1 hover:bg-ivory">+</button>
          </div>
          <span class="font-bold text-xs text-charcoal">₹${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      </div>
      <button onclick="removeFromCart(${item.id})" class="text-mutedText hover:text-rose-600 p-1" title="Remove">
        ✕
      </button>
    </div>
  `).join('');

  // Calculate Subtotal & Shipping
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeThreshold = Number(state.settings.free_shipping_threshold) || 5000;
  const flatRate = Number(state.settings.shipping_flat_rate) || 150;
  const shipping = subtotal >= freeThreshold ? 0 : flatRate;

  let discount = 0;
  if (state.appliedCoupon) {
    discount = state.appliedCoupon.discount || 0;
  }

  const total = Math.max(0, subtotal - discount + shipping);

  document.getElementById('cartSubtotal').textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById('cartShipping').textContent = shipping === 0 ? 'Free (Eligible)' : `₹${shipping}`;
  document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;

  const discountRow = document.getElementById('discountRow');
  if (discountRow) {
    if (discount > 0) {
      discountRow.classList.remove('hidden');
      document.getElementById('cartDiscount').textContent = `-₹${discount.toLocaleString()}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }
}

function openCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    overlay.classList.remove('hidden');
    setTimeout(() => {
      drawer.classList.remove('translate-x-full');
    }, 10);
  }
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (overlay && drawer) {
    drawer.classList.add('translate-x-full');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  }
}

// --------------------------------------------------------
// 5. COUPON CODE APPLICATION
// --------------------------------------------------------
async function applyCouponCode() {
  const input = document.getElementById('couponInput');
  const msg = document.getElementById('couponMsg');
  const code = input?.value?.trim();
  if (!code) return;

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  try {
    const res = await fetch('/api/coupons/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await res.json();
    if (data.success) {
      state.appliedCoupon = data;
      msg.className = 'text-xs text-emerald-700 block';
      msg.textContent = `✓ ${data.message} (-₹${data.discount})`;
      updateCartUI();
    } else {
      state.appliedCoupon = null;
      msg.className = 'text-xs text-rose-600 block';
      msg.textContent = `✕ ${data.message}`;
      updateCartUI();
    }
  } catch (err) {
    msg.className = 'text-xs text-rose-600 block';
    msg.textContent = 'Failed to apply coupon.';
  }
}

// --------------------------------------------------------
// 6. CUSTOM ABAYA 6-STEP WIZARD (Signature Feature)
// --------------------------------------------------------
function openCustomAbayaModal() {
  state.customWizardStep = 1;
  showWizardStep(1);
  const modal = document.getElementById('customAbayaModal');
  if (modal) modal.classList.remove('hidden');
  updateCustomAbayaPrice();
}

function closeCustomAbayaModal() {
  const modal = document.getElementById('customAbayaModal');
  if (modal) modal.classList.add('hidden');
}

function showWizardStep(step) {
  state.customWizardStep = step;
  const totalSteps = 5;

  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = document.getElementById(`step${i}`);
    if (stepEl) stepEl.classList.toggle('hidden', i !== step);
  }

  const indicator = document.getElementById('wizardStepIndicator');
  const stepTitles = [
    'Choose Foundation Silhouette',
    'Select Drape Fabric & Shade',
    'Bespoke Artisan Accents',
    'Enter Tailor Measurements',
    'Review & Consultation Summary',
  ];
  if (indicator) {
    indicator.textContent = `Step ${step} of ${totalSteps}: ${stepTitles[step - 1]}`;
  }

  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');

  if (prevBtn) prevBtn.classList.toggle('hidden', step === 1);
  if (nextBtn) nextBtn.classList.toggle('hidden', step === totalSteps);
  if (submitBtn) submitBtn.classList.toggle('hidden', step !== totalSteps);

  updateCustomAbayaPrice();
}

function nextWizardStep() {
  if (state.customWizardStep < 5) {
    showWizardStep(state.customWizardStep + 1);
  }
}

function prevWizardStep() {
  if (state.customWizardStep > 1) {
    showWizardStep(state.customWizardStep - 1);
  }
}

async function updateCustomAbayaPrice() {
  const silhouette = document.querySelector('input[name="silhouette"]:checked')?.value || 'Closed Abaya';
  const fabric = document.querySelector('input[name="fabric"]:checked')?.value || 'Premium Matte Crepe';
  const details = Array.from(document.querySelectorAll('input[name="customDetails"]:checked')).map(cb => cb.value);

  try {
    const res = await fetch('/api/custom-abaya/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ silhouette, fabric, details }),
    });
    const data = await res.json();
    if (data.success && data.breakdown) {
      const { basePrice, additions, estimatedTotal } = data.breakdown;
      const baseEl = document.getElementById('summaryBasePrice');
      const addEl = document.getElementById('summaryAdditions');
      const totEl = document.getElementById('summaryTotal');

      if (baseEl) baseEl.textContent = `₹${basePrice.toLocaleString()}`;
      if (addEl) addEl.textContent = `+₹${additions.toLocaleString()}`;
      if (totEl) totEl.textContent = `₹${estimatedTotal.toLocaleString()}`;
    }
  } catch (err) {
    console.warn('Error calculating custom price:', err);
  }
}

// Add Custom Abaya Item into Cart
function handleCustomAbayaSubmit(e) {
  e.preventDefault();

  const silhouette = document.querySelector('input[name="silhouette"]:checked')?.value || 'Closed Abaya';
  const fabric = document.querySelector('input[name="fabric"]:checked')?.value || 'Premium Matte Crepe';
  const color = document.querySelector('input[name="customColor"]:checked')?.value || 'Midnight Black';
  const details = Array.from(document.querySelectorAll('input[name="customDetails"]:checked')).map(cb => cb.value);

  const measurements = {
    length: document.getElementById('mLength')?.value || '54',
    shoulder: document.getElementById('mShoulder')?.value || '15',
    bust: document.getElementById('mBust')?.value || '40',
    waist: document.getElementById('mWaist')?.value || '38',
    hips: document.getElementById('mHips')?.value || '44',
    sleeve: document.getElementById('mSleeve')?.value || '26',
  };

  const notes = document.getElementById('customNotes')?.value || '';
  const totalText = document.getElementById('summaryTotal')?.textContent || '5500';
  const finalPrice = Number(totalText.replace(/[^0-9]/g, '')) || 5500;

  addToCart({
    product_id: null,
    title: `Bespoke Custom ${silhouette}`,
    price: finalPrice,
    image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=400&auto=format&fit=crop',
    size: `L${measurements.length}″ (Tailored)`,
    color: color,
    quantity: 1,
    custom_config: {
      silhouette,
      fabric,
      color,
      details,
      measurements,
      special_instructions: notes,
    },
  });

  closeCustomAbayaModal();
  openCartDrawer();
}

// --------------------------------------------------------
// 7. CHECKOUT & SECURE PAYMENT CONTROLLER
// --------------------------------------------------------
function openCheckoutModal() {
  if (state.cart.length === 0) {
    alert('Your shopping bag is empty.');
    return;
  }
  closeCartDrawer();
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeThreshold = Number(state.settings.free_shipping_threshold) || 5000;
  const shipping = subtotal >= freeThreshold ? 0 : (Number(state.settings.shipping_flat_rate) || 150);
  const discount = state.appliedCoupon?.discount || 0;
  const tax = Math.round(Math.max(0, subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  document.getElementById('checkoutPayableTotal').textContent = `₹${total.toLocaleString()}`;
  document.getElementById('checkoutModal').classList.remove('hidden');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('checkoutSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing Order...';

  const customer_name = document.getElementById('custName').value.trim();
  const customer_email = document.getElementById('custEmail').value.trim();
  const customer_phone = document.getElementById('custPhone').value.trim();
  const shipping_address = document.getElementById('custAddress').value.trim();
  const payment_method = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'razorpay';

  try {
    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        items: state.cart,
        coupon_code: state.appliedCoupon?.code || null,
        payment_method,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to place order.');
    }

    const { order } = data;

    // Handle Razorpay Payment flow
    if (payment_method === 'razorpay' && order.razorpay_order_id && typeof Razorpay !== 'undefined') {
      const options = {
        key: state.settings.razorpay_key_id || 'rzp_test_placeholder',
        amount: Math.round(order.total * 100),
        currency: state.settings.currency || 'INR',
        name: 'Meher Mahel',
        description: `Order ${order.order_number}`,
        order_id: order.razorpay_order_id,
        prefill: {
          name: customer_name,
          email: customer_email,
          contact: customer_phone,
        },
        theme: { color: '#C88F91' },
        handler: async function (response) {
          // Verify on backend
          await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          completeOrderSuccess(order.order_number);
        },
        modal: {
          ondismiss: function () {
            completeOrderSuccess(order.order_number, true);
          },
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } else {
      // Direct success (Cash on Delivery or Test Mode)
      completeOrderSuccess(order.order_number);
    }
  } catch (err) {
    alert(err.message || 'Payment initiation failed.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm & Pay';
  }
}

function completeOrderSuccess(orderNumber, isPendingPayment = false) {
  // Clear cart
  state.cart = [];
  state.appliedCoupon = null;
  saveCart();
  updateCartUI();
  closeCheckoutModal();

  alert(`✨ Order Confirmed!\n\nYour Meher Mahel order number is: ${orderNumber}\n${isPendingPayment ? 'Status: Awaiting Payment' : 'Status: Placed & Confirmed'}\n\nYou can track this purchase anytime using the Track Order button.`);
  
  // Open order track modal to show timeline
  openOrderTrackModal();
  document.getElementById('trackInput').value = orderNumber;
  handleTrackOrder();
}

// --------------------------------------------------------
// 8. ORDER TRACKING LOOKUP
// --------------------------------------------------------
function openOrderTrackModal() {
  document.getElementById('orderTrackModal').classList.remove('hidden');
}

function closeOrderTrackModal() {
  document.getElementById('orderTrackModal').classList.add('hidden');
}

async function handleTrackOrder() {
  const input = document.getElementById('trackInput');
  const container = document.getElementById('trackResultContainer');
  const orderNum = input?.value?.trim();
  if (!orderNum) return;

  container.classList.remove('hidden');
  container.innerHTML = `<p class="text-xs text-mutedText text-center py-4">Fetching order status from atelier...</p>`;

  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderNum)}`);
    const data = await res.json();
    if (!data.success || !data.order) {
      container.innerHTML = `<p class="text-xs text-rose-600 text-center py-4">No order found with reference "${orderNum}". Please verify your order number.</p>`;
      return;
    }

    const { order } = data;
    container.innerHTML = `
      <div class="bg-ivory p-4 rounded-2xl border border-subtleBorder space-y-3">
        <div class="flex items-center justify-between border-b border-subtleBorder pb-2">
          <div>
            <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider">Order Reference</span>
            <h4 class="font-mono text-sm font-bold text-charcoal">${order.order_number}</h4>
          </div>
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-dustyRose/15 text-dustyRose">
            ${order.status}
          </span>
        </div>

        <div class="text-xs text-mutedText space-y-1">
          <p>Order Total: <span class="font-bold text-charcoal">₹${order.total.toLocaleString()}</span></p>
          <p>Payment: <span class="capitalize font-semibold text-charcoal">${order.payment_status}</span></p>
          ${order.tracking_number ? `<p class="text-emerald-700 font-semibold">Courier Tracking: ${order.tracking_number}</p>` : ''}
        </div>

        <!-- Timeline Steps -->
        <div class="pt-3 border-t border-subtleBorder space-y-2">
          <p class="text-[11px] font-bold uppercase tracking-wider text-charcoal">Fulfillment Progress</p>
          ${order.steps.map(step => `
            <div class="flex items-center gap-2.5 text-xs">
              <span class="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${step.completed ? 'bg-emerald-600 text-white' : 'bg-subtleBorder text-mutedText'}">
                ${step.completed ? '✓' : '•'}
              </span>
              <span class="${step.completed ? 'text-charcoal font-medium' : 'text-mutedText'}">${step.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="text-xs text-rose-600 text-center py-4">Failed to retrieve tracking info.</p>`;
  }
}

// --------------------------------------------------------
// 9. WISHLIST MANAGEMENT
// --------------------------------------------------------
function toggleWishlist(productId, e) {
  if (e) e.stopPropagation();
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
  } else {
    state.wishlist.push(productId);
  }
  localStorage.setItem('mm_wishlist', JSON.stringify(state.wishlist));
  updateWishlistUI();
  renderProducts(state.products);
}

function updateWishlistUI() {
  const countEl = document.getElementById('wishlistCount');
  if (countEl) countEl.textContent = state.wishlist.length;
}

// --------------------------------------------------------
// 10. SIZE GUIDE MODAL
// --------------------------------------------------------
function openSizeGuideModal() {
  document.getElementById('sizeGuideModal').classList.remove('hidden');
}

function closeSizeGuideModal() {
  document.getElementById('sizeGuideModal').classList.add('hidden');
}

// --------------------------------------------------------
// 11. POLICY MODALS
// --------------------------------------------------------
function openPolicyModal(type) {
  const policies = {
    shipping: {
      title: 'Shipping & Delivery',
      content: 'Ready-to-wear pieces are dispatched within 2–3 business days. Bespoke custom abayas require 7–12 business days of hand craftsmanship in our atelier before courier dispatch. Complimentary insured delivery on orders exceeding ₹5,000.',
    },
    returns: {
      title: 'Returns & Exchange Policy',
      content: 'Standard ready-to-wear items may be exchanged within 7 days of delivery in their original unworn condition with tags attached. Made-to-measure bespoke abayas are custom tailored to individual client dimensions and are non-refundable; however, we provide complimentary alteration consultations if adjustments are required.',
    },
    privacy: {
      title: 'Privacy Policy',
      content: 'Meher Mahel values your privacy. Client contact details and bespoke measurements are encrypted and retained solely for order fulfillment and atelier tailoring communications. We never sell or share client data with third parties.',
    },
    terms: {
      title: 'Terms of Service',
      content: 'By placing an order with Meher Mahel, you agree to our atelier policies, measurement verification guidelines, and standard boutique terms of service.',
    },
  };

  const p = policies[type] || policies.shipping;
  alert(`Meher Mahel — ${p.title}\n\n${p.content}`);
}

// --------------------------------------------------------
// 12. EVENT LISTENERS
// --------------------------------------------------------
function setupEventListeners() {
  // Carousel controls
  document.getElementById('heroPrevBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    prevHeroSlide();
    startHeroAutoplay();
  });
  document.getElementById('heroNextBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    nextHeroSlide();
    startHeroAutoplay();
  });

  const heroSection = document.getElementById('heroCarousel');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopHeroAutoplay);
    heroSection.addEventListener('mouseleave', startHeroAutoplay);

    // Touch & Swipe gestures for mobile / touch devices
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      stopHeroAutoplay();
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX < 0) {
          nextHeroSlide();
        } else {
          prevHeroSlide();
        }
      }
      startHeroAutoplay();
    }, { passive: true });
  }

  // Keyboard navigation for hero carousel
  window.addEventListener('keydown', (e) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') {
      prevHeroSlide();
      startHeroAutoplay();
    } else if (e.key === 'ArrowRight') {
      nextHeroSlide();
      startHeroAutoplay();
    }
  });

  // Drawers & Modals
  document.getElementById('cartBtn')?.addEventListener('click', openCartDrawer);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCartDrawer);

  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('mobileDrawer')?.classList.remove('hidden');
  });
  document.getElementById('closeMobileDrawer')?.addEventListener('click', () => {
    document.getElementById('mobileDrawer')?.classList.add('hidden');
  });

  // Search
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    document.getElementById('searchModal')?.classList.remove('hidden');
    document.getElementById('searchInput')?.focus();
  });
  document.getElementById('closeSearchBtn')?.addEventListener('click', () => {
    document.getElementById('searchModal')?.classList.add('hidden');
  });

  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    if (!query) {
      resultsContainer.innerHTML = '<p class="text-xs text-mutedText py-4 text-center">Type keyword above to explore the collection.</p>';
      return;
    }

    const matches = state.products.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
    );

    if (matches.length === 0) {
      resultsContainer.innerHTML = '<p class="text-xs text-mutedText py-4 text-center">No pieces match your search.</p>';
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div onclick="quickViewProduct('${m.slug}'); document.getElementById('searchModal').classList.add('hidden');" class="py-2.5 flex items-center justify-between cursor-pointer hover:bg-ivory/60 px-2 rounded-lg">
        <div class="flex items-center gap-3">
          <img src="${m.images?.[0] || ''}" alt="${m.title}" class="w-10 h-12 object-cover rounded">
          <div>
            <h5 class="font-serif text-sm font-bold text-charcoal">${m.title}</h5>
            <span class="text-[10px] text-antiqueGold uppercase">${m.category_name}</span>
          </div>
        </div>
        <span class="text-xs font-semibold text-charcoal">₹${m.price.toLocaleString()}</span>
      </div>
    `).join('');
  });

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value;
    const fb = document.getElementById('newsletterFeedback');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (fb) {
        fb.textContent = data.message || 'Welcome to our circle.';
        fb.classList.remove('hidden');
      }
      document.getElementById('newsletterEmail').value = '';
    } catch {
      if (fb) {
        fb.textContent = 'Subscription received.';
        fb.classList.remove('hidden');
      }
    }
  });

  // Custom Abaya form live changes
  document.querySelectorAll('#customAbayaForm input').forEach(input => {
    input.addEventListener('change', updateCustomAbayaPrice);
  });
}

function closeDrawer() {
  document.getElementById('mobileDrawer')?.classList.add('hidden');
}
