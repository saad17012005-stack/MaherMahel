// ========================================================
// MEHER MAHEL — CLIENT ACCOUNT PORTAL CONTROLLER
// ========================================================

const state = {
  token: localStorage.getItem('mm_token'),
  user: null,
  profile: null,
  orders: [],
  customOrders: [],
  addresses: [],
  wishlist: [],
  currentTab: 'profile',
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const yearEl = document.getElementById('portalYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (!state.token) {
    redirectToLogin();
    return;
  }

  const authenticated = await verifySession();
  if (authenticated) {
    // Initial data load
    loadProfile();
    loadOrders();
    loadCustomOrders();
    loadAddresses();
    loadWishlist();

    // Check URL hash for tab (e.g. #orders)
    const hash = window.location.hash.replace('#', '');
    if (['profile', 'orders', 'custom', 'addresses', 'wishlist', 'security'].includes(hash)) {
      switchTab(hash);
    }
  }
});

function redirectToLogin() {
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_user');
  window.location.href = `/auth.html?mode=login&redirect=${encodeURIComponent(window.location.pathname)}`;
}

// Session Verification
async function verifySession() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!data.success || !data.user) {
      redirectToLogin();
      return false;
    }

    state.user = data.user;
    updateUserHeader(data.user);
    return true;
  } catch (err) {
    console.error('Session verification error:', err);
    redirectToLogin();
    return false;
  }
}

// Update Top Greeting & Header
function updateUserHeader(user) {
  const greetingEl = document.getElementById('userGreetingName');
  if (greetingEl) greetingEl.textContent = user.full_name || 'Valued Client';

  const emailEl = document.getElementById('userEmailSub');
  if (emailEl) emailEl.textContent = user.email;

  const initialEl = document.getElementById('userAvatarInitial');
  if (initialEl) {
    const initial = (user.full_name || user.email || 'M').charAt(0).toUpperCase();
    initialEl.textContent = initial;
  }

  const joinedEl = document.getElementById('userJoinedSub');
  if (joinedEl && user.created_at) {
    const d = new Date(user.created_at);
    joinedEl.textContent = `Client since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }

  const badgeEl = document.getElementById('userVerifyBadge');
  if (badgeEl) {
    badgeEl.classList.remove('hidden');
    if (user.is_verified) {
      badgeEl.className = 'text-[10px] px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200';
      badgeEl.textContent = 'Verified Client ✓';
    } else {
      badgeEl.className = 'text-[10px] px-2.5 py-0.5 rounded-full font-semibold border bg-amber-50 text-amber-800 border-amber-200';
      badgeEl.textContent = 'Account Active';
    }
  }
}

// Tab Switching
function switchTab(tabName) {
  state.currentTab = tabName;
  window.location.hash = tabName;

  // Update nav buttons
  const navButtons = document.querySelectorAll('.tab-nav-btn');
  navButtons.forEach(btn => {
    btn.className = 'tab-nav-btn w-full text-left px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-3 text-charcoal hover:bg-ivory';
  });

  const activeBtn = document.getElementById(`nav-${tabName}`);
  if (activeBtn) {
    activeBtn.className = 'tab-nav-btn w-full text-left px-4 py-3 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-3 text-white bg-charcoal shadow-sm';
  }

  // Update panels
  const panels = document.querySelectorAll('.tab-content');
  panels.forEach(p => p.classList.add('hidden'));

  const activePanel = document.getElementById(`tab-${tabName}`);
  if (activePanel) {
    activePanel.classList.remove('hidden');
  }

  showFeedback('', '');
}

function showFeedback(type, message) {
  const el = document.getElementById('accountFeedback');
  if (!message) {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-red-50', 'text-red-800', 'border-red-200');
  if (type === 'success') {
    el.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
    el.innerHTML = `<span>✓ ${message}</span><button onclick="showFeedback('','')">✕</button>`;
  } else {
    el.classList.add('bg-red-50', 'text-red-800', 'border-red-200');
    el.innerHTML = `<span>⚠️ ${message}</span><button onclick="showFeedback('','')">✕</button>`;
  }
}

// --------------------------------------------------------
// 1. PROFILE
// --------------------------------------------------------
async function loadProfile() {
  try {
    const res = await fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (data.success && data.profile) {
      state.profile = data.profile;
      document.getElementById('profFullName').value = data.profile.full_name || '';
      document.getElementById('profEmail').value = data.profile.email || '';
      document.getElementById('profPhone').value = data.profile.phone || '';
    }
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('profSaveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const full_name = document.getElementById('profFullName').value.trim();
  const phone = document.getElementById('profPhone').value.trim();

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ full_name, phone }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update profile.');

    showFeedback('success', 'Profile details updated successfully.');
    updateUserHeader({ ...state.user, full_name, phone });
  } catch (err) {
    showFeedback('error', err.message || 'Could not update profile.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Profile Changes';
  }
}

// --------------------------------------------------------
// 2. MY ORDERS
// --------------------------------------------------------
async function loadOrders() {
  const container = document.getElementById('ordersListContainer');
  const countBadge = document.getElementById('orderTotalCountBadge');

  try {
    const res = await fetch('/api/user/orders', {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    state.orders = data.orders || [];

    if (countBadge) {
      countBadge.textContent = `${state.orders.length} Order${state.orders.length === 1 ? '' : 's'}`;
    }

    if (state.orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-ivory rounded-2xl border border-subtleBorder p-6">
          <p class="text-3xl mb-2">🛍️</p>
          <h4 class="font-serif text-lg font-bold text-charcoal">No Orders Placed Yet</h4>
          <p class="text-xs text-mutedText mt-1 mb-4">Discover our graceful abayas and luxury handcrafted collections.</p>
          <a href="/#shop-section" class="inline-block bg-dustyRose hover:bg-deepRose text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl transition-all">
            Explore Collection →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = state.orders.map(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      let statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
      if (order.order_status === 'Delivered') statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      else if (order.order_status === 'Shipped') statusColor = 'bg-blue-50 text-blue-800 border-blue-200';
      else if (order.order_status === 'Cancelled') statusColor = 'bg-red-50 text-red-800 border-red-200';

      return `
        <div class="bg-ivory/60 rounded-2xl p-5 border border-subtleBorder hover:border-dustyRose/60 transition-all">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtleBorder pb-3">
            <div>
              <span class="font-mono text-xs font-bold text-charcoal block">${order.order_number}</span>
              <span class="text-[11px] text-mutedText">Placed on ${date}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold ${statusColor}">
                ${order.order_status}
              </span>
              <span class="font-bold text-sm text-charcoal">₹${Number(order.total).toLocaleString()}</span>
            </div>
          </div>

          <!-- Items Preview -->
          <div class="py-3 space-y-2">
            ${order.items?.map(it => `
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-charcoal">${it.quantity}x ${it.product_title} (${it.size})</span>
                <span class="text-mutedText">₹${(it.price * it.quantity).toLocaleString()}</span>
              </div>
            `).join('') || '<span class="text-xs text-mutedText">Boutique items</span>'}
          </div>

          <div class="pt-3 border-t border-subtleBorder flex items-center justify-between text-xs">
            <span class="text-mutedText text-[11px]">Payment: <strong class="text-charcoal uppercase">${order.payment_method}</strong> (${order.payment_status})</span>
            <a href="/#orderTrackModal" onclick="trackSpecificOrder('${order.order_number}')" class="text-dustyRose font-semibold hover:underline flex items-center gap-1">
              <span>Track Dispatch</span>
              <span>→</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading orders:', err);
    container.innerHTML = '<p class="text-xs text-red-600 py-6 text-center">Failed to load orders.</p>';
  }
}

function trackSpecificOrder(orderNumber) {
  sessionStorage.setItem('mm_track_order', orderNumber);
  window.location.href = `/?track=${orderNumber}`;
}

// --------------------------------------------------------
// 3. CUSTOM ABAYA ORDERS
// --------------------------------------------------------
async function loadCustomOrders() {
  const container = document.getElementById('customOrdersListContainer');

  try {
    const res = await fetch('/api/user/custom-orders', {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    state.customOrders = data.custom_orders || [];

    if (state.customOrders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-ivory rounded-2xl border border-subtleBorder p-6">
          <p class="text-3xl mb-2">✂️</p>
          <h4 class="font-serif text-lg font-bold text-charcoal">No Bespoke Atelier Commissions</h4>
          <p class="text-xs text-mutedText mt-1 mb-4">Design your one-of-a-kind abaya with custom measurements, luxury fabric, and handcrafted accents.</p>
          <button onclick="openCustomAbayaModal()" class="bg-dustyRose hover:bg-deepRose text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl transition-all">
            Start Bespoke Design →
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = state.customOrders.map(co => {
      const date = new Date(co.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      return `
        <div class="bg-ivory/60 rounded-2xl p-5 border border-subtleBorder">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtleBorder pb-3">
            <div>
              <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider">Order #${co.order_id ? 'Commission Linked' : 'Bespoke Request'}</span>
              <h4 class="font-serif text-lg font-bold text-charcoal">${co.silhouette}</h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border font-semibold bg-deepRose/10 text-deepRose border-deepRose/20">
                ${co.production_status || 'Awaiting Review'}
              </span>
              <span class="font-bold text-sm text-charcoal">₹${Number(co.estimated_price).toLocaleString()}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
            <div>
              <span class="text-mutedText block text-[10px] uppercase">Fabric</span>
              <span class="font-semibold text-charcoal">${co.fabric}</span>
            </div>
            <div>
              <span class="text-mutedText block text-[10px] uppercase">Color</span>
              <span class="font-semibold text-charcoal">${co.color}</span>
            </div>
            <div>
              <span class="text-mutedText block text-[10px] uppercase">Sleeve & Cuffs</span>
              <span class="font-semibold text-charcoal">${co.sleeve_style || 'Standard'} / ${co.cuffs || 'Plain'}</span>
            </div>
            <div>
              <span class="text-mutedText block text-[10px] uppercase">Accents</span>
              <span class="font-semibold text-charcoal">${co.details || 'Artisanal Finish'}</span>
            </div>
          </div>

          <div class="pt-3 border-t border-subtleBorder flex items-center justify-between text-xs">
            <span class="text-mutedText text-[11px]">Requested on ${date}</span>
            <a href="https://wa.me/917609874187?text=Hi%20Meher%20Mahel%2C%20I%20have%20an%20inquiry%20about%20my%20Custom%20Abaya%20(${encodeURIComponent(co.silhouette)})." target="_blank" class="text-dustyRose font-semibold hover:underline">
              Contact Atelier Master on WhatsApp →
            </a>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading custom orders:', err);
    container.innerHTML = '<p class="text-xs text-red-600 py-6 text-center">Failed to load custom abaya orders.</p>';
  }
}

// --------------------------------------------------------
// 4. SAVED ADDRESSES
// --------------------------------------------------------
async function loadAddresses() {
  const container = document.getElementById('addressesListContainer');

  try {
    const res = await fetch('/api/user/addresses', {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    state.addresses = data.addresses || [];

    if (state.addresses.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 bg-ivory rounded-2xl border border-subtleBorder p-6 col-span-2">
          <p class="text-2xl mb-1">📍</p>
          <h4 class="font-serif text-base font-bold text-charcoal">No Saved Addresses</h4>
          <p class="text-xs text-mutedText mt-0.5 mb-3">Save delivery addresses for faster checkout on your next purchase.</p>
          <button onclick="openAddressModal()" class="bg-charcoal text-white text-xs uppercase tracking-wider font-semibold px-4 py-2 rounded-xl">
            Add Delivery Address
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = state.addresses.map(addr => `
      <div class="bg-ivory/60 rounded-2xl p-5 border ${addr.is_default ? 'border-dustyRose/80 bg-dustyRose/5 shadow-sm' : 'border-subtleBorder'} flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-charcoal">${addr.recipient_name}</span>
            ${addr.is_default ? '<span class="text-[9px] uppercase tracking-wider font-bold bg-dustyRose text-white px-2 py-0.5 rounded-full">Default Address</span>' : ''}
          </div>
          <p class="text-xs text-mutedText leading-relaxed">
            ${addr.address_line_1}${addr.address_line_2 ? ', ' + addr.address_line_2 : ''}<br>
            ${addr.city}, ${addr.state} — ${addr.postal_code}<br>
            ${addr.country || 'India'}<br>
            Phone: <strong class="text-charcoal">${addr.phone}</strong>
          </p>
        </div>

        <div class="pt-4 mt-4 border-t border-subtleBorder flex items-center justify-between text-xs">
          <button onclick="openAddressModal('${addr.id}')" class="text-dustyRose font-semibold hover:underline">
            Edit
          </button>
          <button onclick="handleDeleteAddress('${addr.id}')" class="text-mutedText hover:text-red-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading addresses:', err);
    container.innerHTML = '<p class="text-xs text-red-600 py-6 text-center col-span-2">Failed to load addresses.</p>';
  }
}

function openAddressModal(addressId = null) {
  const modal = document.getElementById('addressModal');
  const title = document.getElementById('addressModalTitle');
  const editId = document.getElementById('editAddressId');

  document.getElementById('addressForm').reset();

  if (addressId) {
    const addr = state.addresses.find(a => a.id === addressId);
    if (addr) {
      title.textContent = 'Edit Address';
      editId.value = addr.id;
      document.getElementById('addrRecipient').value = addr.recipient_name;
      document.getElementById('addrPhone').value = addr.phone;
      document.getElementById('addrLine1').value = addr.address_line_1;
      document.getElementById('addrLine2').value = addr.address_line_2 || '';
      document.getElementById('addrCity').value = addr.city;
      document.getElementById('addrState').value = addr.state;
      document.getElementById('addrPostal').value = addr.postal_code;
      document.getElementById('addrCountry').value = addr.country || 'India';
      document.getElementById('addrDefault').checked = Boolean(addr.is_default);
    }
  } else {
    title.textContent = 'Add New Address';
    editId.value = '';
    document.getElementById('addrRecipient').value = state.profile?.full_name || '';
    document.getElementById('addrPhone').value = state.profile?.phone || '';
  }

  modal.classList.remove('hidden');
}

function closeAddressModal() {
  document.getElementById('addressModal').classList.add('hidden');
}

async function handleSaveAddress(e) {
  e.preventDefault();
  const editId = document.getElementById('editAddressId').value;
  const isEditing = Boolean(editId);

  const payload = {
    recipient_name: document.getElementById('addrRecipient').value.trim(),
    phone: document.getElementById('addrPhone').value.trim(),
    address_line_1: document.getElementById('addrLine1').value.trim(),
    address_line_2: document.getElementById('addrLine2').value.trim(),
    city: document.getElementById('addrCity').value.trim(),
    state: document.getElementById('addrState').value.trim(),
    postal_code: document.getElementById('addrPostal').value.trim(),
    country: document.getElementById('addrCountry').value.trim() || 'India',
    is_default: document.getElementById('addrDefault').checked,
  };

  try {
    const url = isEditing ? `/api/user/addresses/${editId}` : '/api/user/addresses';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to save address.');

    closeAddressModal();
    showFeedback('success', isEditing ? 'Address updated successfully.' : 'New address added.');
    loadAddresses();
  } catch (err) {
    alert(err.message || 'Error saving address.');
  }
}

async function handleDeleteAddress(id) {
  if (!confirm('Are you sure you want to remove this saved address?')) return;

  try {
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete address.');

    showFeedback('success', 'Address deleted.');
    loadAddresses();
  } catch (err) {
    showFeedback('error', err.message || 'Could not delete address.');
  }
}

// --------------------------------------------------------
// 5. MY WISHLIST
// --------------------------------------------------------
async function loadWishlist() {
  const container = document.getElementById('wishlistGridContainer');
  const countBadge = document.getElementById('wishlistCountBadge');

  try {
    const res = await fetch('/api/user/wishlist', {
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    state.wishlist = data.wishlist || [];

    if (countBadge) {
      countBadge.textContent = `${state.wishlist.length} Item${state.wishlist.length === 1 ? '' : 's'}`;
    }

    if (state.wishlist.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 bg-ivory rounded-2xl border border-subtleBorder p-6 col-span-full">
          <p class="text-3xl mb-2">❤️</p>
          <h4 class="font-serif text-lg font-bold text-charcoal">Your Wishlist is Empty</h4>
          <p class="text-xs text-mutedText mt-1 mb-4">Save pieces you love while browsing to purchase later.</p>
          <a href="/#shop-section" class="inline-block bg-dustyRose hover:bg-deepRose text-white text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-xl transition-all">
            Discover Boutique Pieces →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = state.wishlist.map(product => {
      const img = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/images/hero1.jpg';
      return `
        <div class="bg-white rounded-2xl border border-subtleBorder overflow-hidden group shadow-sm flex flex-col justify-between">
          <div>
            <div class="aspect-[3/4] relative overflow-hidden bg-ivory">
              <img src="${img}" alt="${product.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            </div>
            <div class="p-4">
              <span class="text-[10px] text-antiqueGold font-bold uppercase tracking-wider block mb-0.5">Meher Mahel</span>
              <h4 class="font-serif text-base font-bold text-charcoal line-clamp-1">${product.title}</h4>
              <p class="font-bold text-xs text-charcoal mt-1">₹${Number(product.price).toLocaleString()}</p>
            </div>
          </div>

          <div class="p-4 pt-0 space-y-2">
            <button onclick="moveWishlistToCart(${product.id}, '${product.title.replace(/'/g, "\\'")}', ${product.price}, '${img}')" class="w-full bg-dustyRose hover:bg-deepRose text-white text-xs uppercase tracking-wider font-semibold py-2.5 rounded-xl transition-colors">
              Move to Bag
            </button>
            <button onclick="removeWishlistItem(${product.id})" class="w-full text-center text-xs text-mutedText hover:text-red-600 transition-colors block">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading wishlist:', err);
    container.innerHTML = '<p class="text-xs text-red-600 py-6 text-center col-span-full">Failed to load wishlist.</p>';
  }
}

async function removeWishlistItem(productId) {
  try {
    const res = await fetch('/api/user/wishlist/toggle', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json();
    if (data.success) {
      loadWishlist();
    }
  } catch (err) {
    console.error(err);
  }
}

function moveWishlistToCart(productId, title, price, image) {
  const cart = JSON.parse(localStorage.getItem('mm_cart') || '[]');
  const existing = cart.find(it => it.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, title, price, image, quantity: 1, size: 'Standard', color: 'Default' });
  }
  localStorage.setItem('mm_cart', JSON.stringify(cart));
  removeWishlistItem(productId);
  alert(`✓ Added ${title} to your shopping bag!`);
}

// --------------------------------------------------------
// 6. SECURITY & ACTIONS
// --------------------------------------------------------
async function handleChangePassword(e) {
  e.preventDefault();
  const btn = document.getElementById('changePasswordBtn');
  btn.disabled = true;
  btn.textContent = 'Updating...';

  const current_password = document.getElementById('secCurrentPassword').value;
  const new_password = document.getElementById('secNewPassword').value;
  const confirm_password = document.getElementById('secConfirmPassword').value;

  if (new_password !== confirm_password) {
    showFeedback('error', 'New passwords do not match.');
    btn.disabled = false;
    btn.textContent = 'Update Password';
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to change password.');

    showFeedback('success', 'Your password has been changed successfully.');
    document.getElementById('secCurrentPassword').value = '';
    document.getElementById('secNewPassword').value = '';
    document.getElementById('secConfirmPassword').value = '';
  } catch (err) {
    showFeedback('error', err.message || 'Could not update password.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Update Password';
  }
}

async function handleDeleteAccountPrompt() {
  const pwd = prompt('Please enter your account password to confirm deletion of your account and personal data:');
  if (!pwd) return;

  try {
    const res = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: pwd }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Deletion failed.');

    alert('Your client account and records have been deleted.');
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    window.location.href = '/';
  } catch (err) {
    alert(err.message || 'Failed to delete account.');
  }
}

function handleLogout() {
  localStorage.removeItem('mm_token');
  localStorage.removeItem('mm_user');
  window.location.href = '/auth.html?mode=login';
}

function openCustomAbayaModal() {
  window.location.href = '/#custom-abaya-section';
}
