// ========================================================
// MEHER MAHEL ADMIN ATELIER PORTAL JAVASCRIPT
// ========================================================

let adminState = {
  activeTab: 'dashboard',
  stats: {},
  orders: [],
  customOrders: [],
  products: [],
  heroSlides: [],
  settings: {},
};

document.addEventListener('DOMContentLoaded', () => {
  loadAdminStats();
  loadAdminOrders();
  loadCustomAbayaQueue();
  loadAdminProducts();
  loadAdminHeroSlides();
  loadAdminSettings();
});

// Tab Switcher
function switchTab(tabName) {
  adminState.activeTab = tabName;
  document.querySelectorAll('.admin-tab').forEach(t => {
    t.classList.remove('active', 'border-dustyRose', 'text-dustyRose');
    t.classList.add('border-transparent', 'text-mutedText');
  });

  const activeBtn = document.getElementById(`tab-${tabName}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-dustyRose', 'text-dustyRose');
    activeBtn.classList.remove('border-transparent', 'text-mutedText');
  }

  document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
  const activeContent = document.getElementById(`section-${tabName}`);
  if (activeContent) activeContent.classList.remove('hidden');

  if (tabName === 'dashboard') loadAdminStats();
  if (tabName === 'orders') loadAdminOrders();
  if (tabName === 'custom-queue') loadCustomAbayaQueue();
  if (tabName === 'products') loadAdminProducts();
  if (tabName === 'hero') loadAdminHeroSlides();
  if (tabName === 'settings') loadAdminSettings();
}

// 1. Load Stats
async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.success && data.stats) {
      adminState.stats = data.stats;
      document.getElementById('statRevenue').textContent = `₹${data.stats.total_revenue.toLocaleString()}`;
      document.getElementById('statOrders').textContent = data.stats.total_orders;
      document.getElementById('statPending').textContent = data.stats.pending_orders;
      document.getElementById('statCustomQueue').textContent = data.stats.custom_queue_count;
      document.getElementById('statProducts').textContent = data.stats.active_products;
      document.getElementById('statLowStock').textContent = data.stats.low_stock_items;

      const badgeCustom = document.getElementById('badgeCustomQueue');
      if (badgeCustom) badgeCustom.textContent = data.stats.custom_queue_count;

      const badgeOrders = document.getElementById('badgeOrdersCount');
      if (badgeOrders) badgeOrders.textContent = data.stats.total_orders;

      renderRecentOrders(data.recent_orders || []);
    }
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }
}

function renderRecentOrders(orders) {
  const table = document.getElementById('recentOrdersTable');
  if (!table) return;

  if (orders.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-mutedText">No orders placed yet.</td></tr>`;
    return;
  }

  table.innerHTML = orders.map(o => `
    <tr class="hover:bg-slate-50">
      <td class="p-4 font-mono font-bold text-charcoal">
        ${o.order_number}
        ${o.utr_id ? `<span class="block text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-200">UTR: ${o.utr_id}</span>` : ''}
        ${o.payment_method ? `<span class="block text-[9px] uppercase tracking-wider text-mutedText mt-0.5">${o.payment_method}</span>` : ''}
      </td>
      <td class="p-4">
        <span class="font-semibold text-charcoal block">${o.customer_name}</span>
        <span class="text-[10px] text-mutedText">${o.customer_email}</span>
      </td>
      <td class="p-4 font-bold text-charcoal">₹${o.total.toLocaleString()}</td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
          ${o.payment_status}
        </span>
      </td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-charcoal">
          ${o.order_status}
        </span>
      </td>
      <td class="p-4 text-[11px] text-mutedText">${new Date(o.created_at).toLocaleDateString()}</td>
      <td class="p-4 text-right">
        <button onclick="switchTab('orders')" class="text-dustyRose font-semibold hover:underline">Manage</button>
      </td>
    </tr>
  `).join('');
}

// 2. Load All Orders
async function loadAdminOrders() {
  const search = document.getElementById('orderSearchInput')?.value?.trim() || '';
  const status = document.getElementById('orderStatusFilter')?.value || 'all';

  let url = `/api/admin/orders?status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      adminState.orders = data.orders;
      renderAdminOrders(data.orders);
    }
  } catch (err) {
    console.error('Error fetching admin orders:', err);
  }
}

function renderAdminOrders(orders) {
  const table = document.getElementById('allOrdersTable');
  if (!table) return;

  if (orders.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-mutedText">No orders matching criteria.</td></tr>`;
    return;
  }

  table.innerHTML = orders.map(o => `
    <tr class="hover:bg-slate-50">
      <td class="p-4 font-mono font-bold text-charcoal">
        ${o.order_number}
        ${o.utr_id ? `<span class="block text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-200">UTR: ${o.utr_id}</span>` : ''}
        ${o.payment_method ? `<span class="block text-[9px] uppercase tracking-wider text-mutedText mt-0.5">${o.payment_method}</span>` : ''}
      </td>
      <td class="p-4">
        <span class="font-bold text-charcoal block">${o.customer_name}</span>
        <span class="text-[10px] text-mutedText block">${o.customer_phone}</span>
        <span class="text-[10px] text-mutedText block">${o.shipping_address}</span>
      </td>
      <td class="p-4">
        <div class="space-y-1">
          ${o.items?.map(it => `
            <div class="text-[11px]">
              <span class="font-medium text-charcoal">${it.quantity}x ${it.product_title}</span>
              <span class="text-mutedText">(${it.size} / ${it.color})</span>
              ${it.custom_config ? '<span class="text-deepRose font-bold block text-[9px]">★ Bespoke Tailored Piece</span>' : ''}
            </div>
          `).join('')}
        </div>
      </td>
      <td class="p-4 font-bold text-charcoal">₹${o.total.toLocaleString()}</td>
      <td class="p-4">
        <select onchange="updateOrderPaymentStatus(${o.id}, this.value)" class="text-xs p-1 rounded border border-subtleBorder">
          <option value="pending" ${o.payment_status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="paid" ${o.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
          <option value="failed" ${o.payment_status === 'failed' ? 'selected' : ''}>Failed</option>
        </select>
      </td>
      <td class="p-4">
        <select onchange="updateOrderStatusValue(${o.id}, this.value)" class="text-xs p-1 rounded border border-subtleBorder font-semibold">
          <option value="Order Placed" ${o.order_status === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
          <option value="Payment Confirmed" ${o.order_status === 'Payment Confirmed' ? 'selected' : ''}>Payment Confirmed</option>
          <option value="In Production" ${o.order_status === 'In Production' ? 'selected' : ''}>In Production</option>
          <option value="Shipped" ${o.order_status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.order_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          <option value="Cancelled" ${o.order_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td class="p-4">
        <input type="text" value="${o.tracking_number || ''}" placeholder="AWB / Courier" 
          onblur="updateOrderTracking(${o.id}, this.value)" class="text-xs p-1.5 rounded border border-subtleBorder w-28">
      </td>
      <td class="p-4 text-right">
        <button onclick="alert('Order Reference: ${o.order_number}\\nUTR / Trans ID: ${o.utr_id || 'N/A'}\\nCustomer: ${o.customer_name}\\nPhone: ${o.customer_phone}\\nShipping: ${o.shipping_address}\\nTotal: ₹${o.total}')" class="text-dustyRose font-semibold hover:underline">View</button>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatusValue(orderId, status) {
  try {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: status }),
    });
    loadAdminStats();
  } catch (err) {
    alert('Failed to update status.');
  }
}

async function updateOrderPaymentStatus(orderId, payment_status) {
  try {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status }),
    });
    loadAdminStats();
  } catch (err) {
    alert('Failed to update payment status.');
  }
}

async function updateOrderTracking(orderId, tracking_number) {
  try {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracking_number }),
    });
  } catch (err) {
    alert('Failed to save tracking number.');
  }
}

// 3. Load Custom Abaya Atelier Queue
async function loadCustomAbayaQueue() {
  try {
    const res = await fetch('/api/admin/custom-orders');
    const data = await res.json();
    if (data.success) {
      adminState.customOrders = data.orders;
      renderCustomAbayaQueue(data.orders);
    }
  } catch (err) {
    console.error('Error fetching custom orders:', err);
  }
}

function renderCustomAbayaQueue(orders) {
  const container = document.getElementById('customAbayaCardsContainer');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `<div class="col-span-full p-12 text-center text-mutedText bg-white rounded-2xl border border-subtleBorder">No bespoke abaya orders in queue.</div>`;
    return;
  }

  container.innerHTML = orders.map(co => `
    <div class="bg-white p-6 rounded-2xl border border-subtleBorder shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-subtleBorder pb-3">
        <div>
          <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider">Order #${co.order_number || 'Direct'}</span>
          <h4 class="font-serif text-lg font-bold text-charcoal">${co.silhouette}</h4>
        </div>
        <div>
          <select onchange="updateCustomOrderStatusValue(${co.id}, this.value)" class="text-xs p-1.5 rounded-lg border border-subtleBorder font-semibold text-deepRose bg-deepRose/5">
            <option value="Awaiting Review" ${co.production_status === 'Awaiting Review' ? 'selected' : ''}>Awaiting Review</option>
            <option value="Pattern Cutting" ${co.production_status === 'Pattern Cutting' ? 'selected' : ''}>Pattern Cutting</option>
            <option value="Stitching" ${co.production_status === 'Stitching' ? 'selected' : ''}>Stitching</option>
            <option value="Quality Check" ${co.production_status === 'Quality Check' ? 'selected' : ''}>Quality Check</option>
            <option value="Ready to Dispatch" ${co.production_status === 'Ready to Dispatch' ? 'selected' : ''}>Ready to Dispatch</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-mutedText block">Client:</span>
          <span class="font-semibold text-charcoal">${co.customer_name}</span>
          <span class="text-[11px] text-mutedText block">${co.customer_phone || ''}</span>
        </div>
        <div>
          <span class="text-mutedText block">Fabric & Shade:</span>
          <span class="font-semibold text-charcoal">${co.fabric}</span>
          <span class="text-[11px] text-dustyRose font-medium block">Color: ${co.color}</span>
        </div>
      </div>

      <!-- Tailor Measurement Blueprint -->
      <div class="bg-ivory p-3.5 rounded-xl border border-subtleBorder text-xs">
        <span class="font-bold text-charcoal text-[11px] uppercase tracking-wider block mb-2">Tailor Measurement Specs (Inches)</span>
        <div class="grid grid-cols-3 gap-2 font-mono">
          <div>Length: <span class="font-bold text-charcoal">${co.measurements?.length || '-'}″</span></div>
          <div>Shoulder: <span class="font-bold text-charcoal">${co.measurements?.shoulder || '-'}″</span></div>
          <div>Bust: <span class="font-bold text-charcoal">${co.measurements?.bust || '-'}″</span></div>
          <div>Waist: <span class="font-bold text-charcoal">${co.measurements?.waist || '-'}″</span></div>
          <div>Hips: <span class="font-bold text-charcoal">${co.measurements?.hips || '-'}″</span></div>
          <div>Sleeve: <span class="font-bold text-charcoal">${co.measurements?.sleeve || '-'}″</span></div>
        </div>
      </div>

      ${co.details ? `
        <div class="text-xs">
          <span class="text-mutedText block">Artisan Details:</span>
          <span class="font-semibold text-charcoal">${co.details}</span>
        </div>
      ` : ''}

      ${co.special_instructions ? `
        <div class="text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900">
          <span class="font-bold block text-[10px] uppercase">Client Instructions:</span>
          ${co.special_instructions}
        </div>
      ` : ''}

      <div class="pt-2 flex justify-between items-center text-xs">
        <span class="font-bold text-charcoal">Commission Value: ₹${co.estimated_price.toLocaleString()}</span>
        <a href="https://wa.me/${(co.customer_phone || '').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(co.customer_name)}%2C%20this%20is%20the%20Meher%20Mahel%20Atelier%20regarding%20your%20custom%20abaya%20measurements." target="_blank" class="text-dustyRose hover:underline font-semibold">Contact Client on WhatsApp →</a>
      </div>
    </div>
  `).join('');
}

async function updateCustomOrderStatusValue(customOrderId, status) {
  try {
    await fetch(`/api/admin/custom-orders/${customOrderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ production_status: status }),
    });
    loadAdminStats();
  } catch (err) {
    alert('Failed to update atelier status.');
  }
}

// 4. Products Management
async function loadAdminProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      adminState.products = data.products;
      renderAdminProducts(data.products);
    }
  } catch (err) {
    console.error('Error fetching admin products:', err);
  }
}

function renderAdminProducts(products) {
  const table = document.getElementById('productsTable');
  if (!table) return;

  table.innerHTML = products.map(p => `
    <tr class="hover:bg-slate-50">
      <td class="p-4 flex items-center gap-3">
        <img src="${p.images?.[0] || ''}" alt="" class="w-10 h-12 object-cover rounded-lg border border-subtleBorder bg-ivory">
        <div>
          <h5 class="font-serif font-bold text-charcoal text-sm">${p.title}</h5>
          <span class="text-[10px] text-mutedText font-mono">${p.sku}</span>
        </div>
      </td>
      <td class="p-4">${p.category_name}</td>
      <td class="p-4 font-bold text-charcoal">₹${p.price.toLocaleString()}</td>
      <td class="p-4">
        <span class="font-semibold text-charcoal">${p.variants?.reduce((s, v) => s + v.stock, 0) || 0}</span> units
      </td>
      <td class="p-4 space-x-1">
        ${p.is_new_arrival ? `<span class="bg-charcoal text-champagneGold text-[9px] px-1.5 py-0.5 rounded">New</span>` : ''}
        ${p.is_best_seller ? `<span class="bg-antiqueGold/20 text-antiqueGold text-[9px] px-1.5 py-0.5 rounded font-bold">Best Seller</span>` : ''}
      </td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-mutedText'}">
          ${p.is_active ? 'Active' : 'Archived'}
        </span>
      </td>
      <td class="p-4 text-right space-x-2">
        <button onclick="editProduct(${p.id})" class="text-dustyRose font-semibold hover:underline">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="text-rose-600 font-semibold hover:underline">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('pmId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Luxury Piece';
  document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
}

function editProduct(productId) {
  const p = adminState.products.find(item => item.id === productId);
  if (!p) return;

  document.getElementById('pmId').value = p.id;
  document.getElementById('pmTitle').value = p.title;
  document.getElementById('pmCategory').value = p.category_id;
  document.getElementById('pmPrice').value = p.price;
  document.getElementById('pmComparePrice').value = p.compare_at_price || '';
  document.getElementById('pmShortDesc').value = p.short_description || '';
  document.getElementById('pmDescription').value = p.description || '';
  document.getElementById('pmImages').value = p.images?.join(', ') || '';
  document.getElementById('pmFabricCare').value = p.fabric_care || '';
  document.getElementById('pmNewArrival').checked = Boolean(p.is_new_arrival);
  document.getElementById('pmBestSeller').checked = Boolean(p.is_best_seller);

  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productModal').classList.remove('hidden');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('pmId').value;
  const title = document.getElementById('pmTitle').value.trim();
  const category_id = Number(document.getElementById('pmCategory').value);
  const price = Number(document.getElementById('pmPrice').value);
  const compare_at_price = document.getElementById('pmComparePrice').value ? Number(document.getElementById('pmComparePrice').value) : null;
  const short_description = document.getElementById('pmShortDesc').value.trim();
  const description = document.getElementById('pmDescription').value.trim();
  const rawImages = document.getElementById('pmImages').value.split(',').map(s => s.trim()).filter(Boolean);
  const fabric_care = document.getElementById('pmFabricCare').value.trim();
  const is_new_arrival = document.getElementById('pmNewArrival').checked;
  const is_best_seller = document.getElementById('pmBestSeller').checked;

  const payload = {
    title,
    category_id,
    price,
    compare_at_price,
    short_description,
    description,
    images: rawImages.length ? rawImages : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=900&auto=format&fit=crop'],
    fabric_care,
    is_new_arrival,
    is_best_seller,
  };

  try {
    if (id) {
      await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    closeProductModal();
    loadAdminProducts();
    loadAdminStats();
  } catch (err) {
    alert('Failed to save product.');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to remove this piece from the catalog?')) return;
  try {
    await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
    loadAdminProducts();
    loadAdminStats();
  } catch (err) {
    alert('Failed to delete product.');
  }
}

// 5. Hero Slides CMS
async function loadAdminHeroSlides() {
  try {
    const res = await fetch('/api/admin/hero-slides');
    const data = await res.json();
    if (data.success) {
      adminState.heroSlides = data.slides;
      renderAdminHeroSlides(data.slides);
    }
  } catch (err) {
    console.error('Error fetching hero slides:', err);
  }
}

function renderAdminHeroSlides(slides) {
  const container = document.getElementById('heroSlidesList');
  if (!container) return;

  container.innerHTML = slides.map(s => `
    <div class="bg-white p-5 rounded-2xl border border-subtleBorder shadow-sm flex flex-col sm:flex-row items-center gap-5">
      <img src="${s.desktop_image}" alt="" class="w-full sm:w-44 h-28 object-cover rounded-xl border border-subtleBorder">
      <div class="flex-grow space-y-1">
        <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider">${s.eyebrow || 'MEHER MAHEL'}</span>
        <h4 class="font-serif text-lg font-bold text-charcoal">${s.heading}</h4>
        <p class="text-xs text-mutedText line-clamp-1">${s.description || ''}</p>
        <div class="text-[11px] text-dustyRose font-semibold pt-1">
          CTA 1: ${s.cta_primary_text || 'None'} → ${s.cta_primary_link || '-'} | CTA 2: ${s.cta_secondary_text || 'None'}
        </div>
      </div>
      <div class="flex sm:flex-col items-center gap-2">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-mutedText'}">
          ${s.is_active ? 'Active' : 'Inactive'}
        </span>
        <button onclick="toggleSlideActive(${s.id}, ${s.is_active ? 0 : 1})" class="text-xs text-charcoal hover:text-dustyRose underline">
          ${s.is_active ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  `).join('');
}

async function toggleSlideActive(slideId, newStatus) {
  try {
    await fetch(`/api/admin/hero-slides/${slideId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newStatus }),
    });
    loadAdminHeroSlides();
  } catch (err) {
    alert('Failed to update slide.');
  }
}

// 6. Store Settings
async function loadAdminSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      adminState.settings = data.settings;
      document.getElementById('settingAnnouncement').value = data.settings.announcement_bar || '';
      document.getElementById('settingWhatsApp').value = data.settings.whatsapp_number || '';
      document.getElementById('settingCurrency').value = data.settings.currency || 'INR';
      document.getElementById('settingShippingRate').value = data.settings.shipping_flat_rate || '150';
      document.getElementById('settingFreeThreshold').value = data.settings.free_shipping_threshold || '5000';
      document.getElementById('settingTaxPercent').value = data.settings.tax_percent || '5';
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
  }
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const settings = {
    announcement_bar: document.getElementById('settingAnnouncement').value.trim(),
    whatsapp_number: document.getElementById('settingWhatsApp').value.trim(),
    currency: document.getElementById('settingCurrency').value.trim(),
    shipping_flat_rate: document.getElementById('settingShippingRate').value.trim(),
    free_shipping_threshold: document.getElementById('settingFreeThreshold').value.trim(),
    tax_percent: document.getElementById('settingTaxPercent').value.trim(),
  };

  try {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    alert('Boutique settings updated successfully.');
  } catch (err) {
    alert('Failed to update settings.');
  }
}
