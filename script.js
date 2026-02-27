/* ================================
   DEFAULT PRODUCT DATA
================================ */
const defaultProducts = [
  {
    id: 1,
    name: "Xiaomi Redmi Buds 4 Lite TWS Earbuds",
    price: "Rp 129.000",
    description: "TWS earbuds dengan koneksi Bluetooth 5.3, bass yang kuat, dan battery life hingga 20 jam. Ringan hanya 3.8 gram per bud, cocok dipakai seharian.",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
    affiliateLink: "https://shope.ee/example-buds",
    category: "Elektronik"
  },
  {
    id: 2,
    name: "Tumbler Thermos Stainless 1 Liter Anti Bocor",
    price: "Rp 85.000",
    description: "Botol minum stainless steel double wall yang bisa menjaga minuman tetap dingin 24 jam dan panas 12 jam. Cocok untuk aktivitas outdoor dan kerja.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
    affiliateLink: "https://shope.ee/example-tumbler",
    category: "Lifestyle"
  },
  {
    id: 3,
    name: "Lampu LED Ring Light 10 Inch + Tripod",
    price: "Rp 95.000",
    description: "Ring light 10 inci dengan 3 mode cahaya dan 10 level kecerahan. Paket sudah termasuk tripod adjustable hingga 150 cm. Ideal untuk konten kreator.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
    affiliateLink: "https://shope.ee/example-ringlight",
    category: "Elektronik"
  },
  {
    id: 4,
    name: "Tas Ransel Laptop Anti Air Slim 20L",
    price: "Rp 175.000",
    description: "Ransel bahan waterproof dengan kompartemen khusus laptop hingga 15.6 inci. Dilengkapi port USB charging eksternal dan desain ergonomis.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    affiliateLink: "https://shope.ee/example-tas",
    category: "Fashion"
  },
  {
    id: 5,
    name: "Mechanical Keyboard TKL RGB Wireless",
    price: "Rp 299.000",
    description: "Keyboard mekanikal tenkeyless dengan switch blue (clicky), backlight RGB 18 mode, koneksi 2.4G wireless dan kabel. Battery 3000mAh awet hingga 3 minggu.",
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
    affiliateLink: "https://shope.ee/example-keyboard",
    category: "Elektronik"
  },
  {
    id: 6,
    name: "Skincare Set Vitamin C Brightening Serum",
    price: "Rp 115.000",
    description: "Serum vitamin C 20% yang membantu mencerahkan kulit, meratakan warna kulit, dan mengurangi bekas jerawat. Formula ringan dan cepat meresap.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    affiliateLink: "https://shope.ee/example-serum",
    category: "Skincare"
  }
];

/* ================================
   STORAGE HELPERS
================================ */
const STORAGE_KEY = 'affiliate_products';

function getProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/* ================================
   ICONS (inline SVG)
================================ */
const icons = {
  shopee: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>`,
  box: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
};

/* ================================
   RENDER PRODUCTS
================================ */
function renderProducts(filter = 'Semua') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const products = getProducts();
  const filtered = filter === 'Semua'
    ? products
    : products.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        ${icons.box}
        <p>Belum ada produk di kategori ini.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="card-image-wrap">
        <img
          src="${escapeHtml(p.image)}"
          alt="${escapeHtml(p.name)}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'"
        />
        <span class="card-badge">★ Worth It</span>
      </div>
      <div class="card-body">
        ${p.category ? `<span class="card-category">${escapeHtml(p.category)}</span>` : ''}
        <h3 class="card-name">${escapeHtml(p.name)}</h3>
        <div class="card-price">${escapeHtml(p.price)}</div>
        <p class="card-desc">${escapeHtml(p.description)}</p>
        <a
          class="card-cta"
          href="${escapeHtml(p.affiliateLink)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${icons.shopee}
          Cek di Shopee
        </a>
      </div>
    </article>
  `).join('');
}

/* ================================
   FILTER PILLS
================================ */
function buildFilters() {
  const container = document.getElementById('filter-pills');
  if (!container) return;

  const products = getProducts();
  const categories = ['Semua', ...new Set(products.map(p => p.category).filter(Boolean))];

  container.innerHTML = categories.map((cat, i) =>
    `<button class="pill ${i === 0 ? 'active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`
  ).join('');

  container.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderProducts(pill.dataset.cat);
  });
}

/* ================================
   HERO CTA – SMOOTH SCROLL
================================ */
function initHeroCta() {
  const btn = document.getElementById('hero-cta');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ================================
   HELPER: ESCAPE HTML
================================ */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ================================
   INIT (index.html)
================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('index-page')) {
    buildFilters();
    renderProducts();
    initHeroCta();
  }
});


/* ================================================================
   ADMIN SYSTEM — only runs on admin.html
================================================================ */
const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'affiliate_admin_session';

/* --- Auth Helpers --- */
function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function login(pw) {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
}

/* --- Toast Notification --- */
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/* --- Admin: Render Table --- */
function renderAdminTable() {
  const tbody = document.getElementById('products-tbody');
  const countEl = document.getElementById('product-count');
  if (!tbody) return;

  const products = getProducts();
  if (countEl) countEl.textContent = products.length;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Belum ada produk. Tambahkan produk pertama Anda.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td class="td-img">
        <img src="${escapeHtml(p.image)}" alt="" onerror="this.src='https://via.placeholder.com/52'">
      </td>
      <td class="td-name">${escapeHtml(p.name)}</td>
      <td class="td-price">${escapeHtml(p.price)}</td>
      <td class="td-cat"><span class="badge">${escapeHtml(p.category || '—')}</span></td>
      <td><a href="${escapeHtml(p.affiliateLink)}" target="_blank" rel="noopener noreferrer" style="font-size:0.78rem;color:var(--shopee);font-weight:500">Lihat Link ↗</a></td>
      <td class="td-actions">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${p.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Hapus</button>
      </td>
    </tr>
  `).join('');
}

/* --- Modal --- */
function openModal(title) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('product-form').reset();
  document.getElementById('edit-id').value = '';
}

/* --- Add / Edit Modal --- */
function openAddModal() {
  document.getElementById('edit-id').value = '';
  document.getElementById('product-form').reset();
  openModal('Tambah Produk Baru');
}

function openEditModal(id) {
  const products = getProducts();
  const p = products.find(p => p.id == id);
  if (!p) return;

  document.getElementById('edit-id').value = p.id;
  document.getElementById('f-name').value = p.name;
  document.getElementById('f-price').value = p.price;
  document.getElementById('f-description').value = p.description;
  document.getElementById('f-image').value = p.image;
  document.getElementById('f-link').value = p.affiliateLink;
  document.getElementById('f-category').value = p.category || '';

  openModal('Edit Produk');
}

/* --- Save Product (Add or Edit) --- */
function saveProduct(e) {
  e.preventDefault();
  const products = getProducts();

  const id = document.getElementById('edit-id').value;
  const name = document.getElementById('f-name').value.trim();
  const price = document.getElementById('f-price').value.trim();
  const description = document.getElementById('f-description').value.trim();
  const image = document.getElementById('f-image').value.trim();
  const affiliateLink = document.getElementById('f-link').value.trim();
  const category = document.getElementById('f-category').value.trim();

  if (!name || !price || !affiliateLink) {
    showToast('Nama, harga, dan link affiliate wajib diisi!', 'error');
    return;
  }

  if (id) {
    // Edit existing
    const idx = products.findIndex(p => p.id == id);
    if (idx > -1) {
      products[idx] = { ...products[idx], name, price, description, image, affiliateLink, category };
      showToast('Produk berhasil diperbarui! ✓');
    }
  } else {
    // Add new
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, price, description, image, affiliateLink, category });
    showToast('Produk berhasil ditambahkan! ✓');
  }

  saveProducts(products);
  closeModal();
  renderAdminTable();
}

/* --- Delete Product --- */
function deleteProduct(id) {
  if (!confirm('Yakin ingin menghapus produk ini?')) return;
  const products = getProducts().filter(p => p.id != id);
  saveProducts(products);
  renderAdminTable();
  showToast('Produk dihapus.', 'error');
}

/* --- Admin Init --- */
function initAdmin() {
  if (!document.body.classList.contains('admin-page')) return;

  const loginSection = document.getElementById('login-section');
  const dashSection = document.getElementById('dashboard-section');

  if (isLoggedIn()) {
    loginSection.style.display = 'none';
    dashSection.style.display = 'block';
    renderAdminTable();
  } else {
    loginSection.style.display = 'flex';
    dashSection.style.display = 'none';
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('admin-password').value;
    if (login(pw)) {
      loginSection.style.display = 'none';
      dashSection.style.display = 'block';
      renderAdminTable();
    } else {
      document.getElementById('login-error').style.display = 'block';
      document.getElementById('login-error').textContent = 'Password salah. Coba lagi.';
    }
  });

  // Product form
  document.getElementById('product-form')?.addEventListener('submit', saveProduct);

  // Modal close
  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', initAdmin);
