/* ================================
   KONFIGURASI GOOGLE SHEETS
   
   CARA PAKAI:
   1. Buka Google Sheets Anda
   2. Klik File > Share > Publish to web
   3. Pilih "Entire Document" dan format "Comma-separated values (.csv)"
   4. Klik Publish, lalu salin link yang muncul
   5. Tempel link tersebut di bawah (ganti PASTE_LINK_CSV_ANDA_DI_SINI)
   
   Format header baris pertama Google Sheets harus PERSIS:
   id , name , price , description , image , affiliateLink , category
================================ */
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSopEemVVM5WpVfAtMPhp00uSHjRObIYxcX94kvHmPON4SN6_yTJVf788KYVeCB9KlMy4iul19GnSKj/pub?output=csv';

/* ================================
   DATA PRODUK DEFAULT (FALLBACK)
   Digunakan jika Google Sheets belum
   dikonfigurasi atau gagal diakses.
================================ */
const defaultProducts = [
  {
    id: 1,
    name: "Rak Dapur Dorong ",
    price: "Rp 38.700",
    description: "Rak ini cocok digunakan di berbagai lingkungan, baik itu di rumah, kantor, gudang, toko, atau tempat lainnya. Dengan desain yang serbaguna.",
    image: "img/rak.jpg",
    affiliateLink: "https://s.shopee.co.id/7po7yu5cqu",
    category: "Furniture"
  },
  {
    id: 2,
    name: "Rak Sepatu X",
    price: "Rp 29.400",
    description: "Rak sepatu. Tersedia beberapa tingat 2/3/4/5/6. cocok ditaruh di mana saja, bisa di toilet, bawah meja, dekat pintu, bawah meja kerja dll.",
    image: "img/rak1.png",
    affiliateLink: "https://s.shopee.co.id/6KzKEG7ITg",
    category: "Furniture"
  },
  {
    id: 3,
    name: "Lampu LED Ring Light 10 Inch + Tripod",
    price: "Rp 95.000",
    description: "Ring light 10 inci dengan 3 mode cahaya dan 10 level kecerahan. Termasuk tripod adjustable hingga 150 cm. Ideal untuk konten kreator.",
    image: "img/redmi-buds.png",
    affiliateLink: "https://shope.ee/example-ringlight",
    category: "Elektronik"
  },
  {
    id: 4,
    name: "Tas Ransel Laptop Anti Air Slim 20L",
    price: "Rp 175.000",
    description: "Ransel waterproof dengan kompartemen khusus laptop hingga 15.6 inci. Dilengkapi port USB charging eksternal dan desain ergonomis.",
    image: "img/redmi-buds.png",
    affiliateLink: "https://shope.ee/example-tas",
    category: "Fashion"
  },
  {
    id: 5,
    name: "Mechanical Keyboard TKL RGB Wireless",
    price: "Rp 299.000",
    description: "Keyboard mekanikal tenkeyless dengan switch blue, backlight RGB 18 mode, koneksi 2.4G wireless dan kabel. Battery 3000mAh.",
    image: "img/redmi-buds.png",
    affiliateLink: "https://shope.ee/example-keyboard",
    category: "Elektronik"
  },
  {
    id: 6,
    name: "Skincare Set Vitamin C Brightening Serum",
    price: "Rp 115.000",
    description: "Serum vitamin C 20% yang membantu mencerahkan kulit, meratakan warna, dan mengurangi bekas jerawat. Formula ringan dan cepat meresap.",
    image: "img/redmi-buds.png",
    affiliateLink: "https://shope.ee/example-serum",
    category: "Skincare"
  }
];

/* ================================
   FETCH PRODUK DARI GOOGLE SHEETS
================================ */
async function fetchProductsFromSheet() {
  // Jika URL belum diisi, pakai data default
  if (!SHEET_CSV_URL || SHEET_CSV_URL === 'PASTE_LINK_CSV_ANDA_DI_SINI') {
    console.info('[AFF] Google Sheets belum dikonfigurasi. Menggunakan data default.');
    return defaultProducts;
  }

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.text();

    // Parsing CSV – skip baris pertama (header)
    const rows = data.split('\n').slice(1);
    const products = rows
      .map(row => {
        const cols = parseCSVRow(row);
        if (!cols || cols.length < 6) return null;
        return {
          id:            cols[0]?.trim(),
          name:          cols[1]?.trim(),
          price:         cols[2]?.trim(),
          description:   cols[3]?.trim(),
          image:         cols[4]?.trim(),
          affiliateLink: cols[5]?.trim(),
          category:      cols[6]?.trim() // .trim() otomatis hapus spasi berlebih
        };
      })
      .filter(p => p && p.id); // hanya baris yang ada ID-nya

    if (products.length === 0) {
      console.warn('[AFF] Sheet kosong atau tidak ada produk valid. Menggunakan data default.');
      return defaultProducts;
    }

    console.info('[AFF] Berhasil memuat ' + products.length + ' produk dari Google Sheets.');
    return products;

  } catch (error) {
    console.error('[AFF] Gagal mengambil data dari Sheets, menggunakan data default:', error);
    return defaultProducts;
  }
}

/* ================================
   HELPER: PARSE SATU BARIS CSV
   Menangani nilai yang mengandung koma
   di dalam tanda kutip:
   "Rak, kayu, murah" → satu kolom
================================ */
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/* ================================
   STATE PRODUK (diisi saat init)
================================ */
let allProducts = [];

/* ================================
   ICONS (inline SVG)
================================ */
const icons = {
  shopee: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  box: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  spinner: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
};

/* ================================
   RENDER PRODUCTS
================================ */
function renderProducts(filter) {
  filter = filter || 'Semua';
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = filter === 'Semua'
    ? allProducts
    : allProducts.filter(function(p) { return p.category === filter; });

  if (filtered.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' + icons.box + '<p>Belum ada produk di kategori ini.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(function(p) {
    return (
      '<article class="product-card" data-id="' + p.id + '">' +
        '<div class="card-image-wrap">' +
          '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy"' +
          ' onerror="this.src=\'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80\'" />' +
          '<span class="card-badge">&#9733; Worth It</span>' +
        '</div>' +
        '<div class="card-body">' +
          (p.category ? '<span class="card-category">' + escapeHtml(p.category) + '</span>' : '') +
          '<h3 class="card-name">' + escapeHtml(p.name) + '</h3>' +
          '<div class="card-price">' + escapeHtml(p.price) + '</div>' +
          '<p class="card-desc">' + escapeHtml(p.description) + '</p>' +
          '<a class="card-cta" href="' + escapeHtml(p.affiliateLink) + '" target="_blank" rel="noopener noreferrer">' +
            icons.shopee + ' Cek di Shopee' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}

/* ================================
   TAMPILKAN LOADING STATE
================================ */
function showLoadingState() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML =
    '<div class="empty-state">' + icons.spinner + '<p>Memuat produk...</p></div>';
}

/* ================================
   FILTER PILLS
================================ */
function buildFilters() {
  const container = document.getElementById('filter-pills');
  if (!container) return;

  const categories = ['Semua'].concat(
    Array.from(new Set(allProducts.map(function(p) { return p.category; }).filter(Boolean)))
  );

  container.innerHTML = categories.map(function(cat, i) {
    return '<button class="pill ' + (i === 0 ? 'active' : '') + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>';
  }).join('');

  container.addEventListener('click', function(e) {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    container.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
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
  btn.addEventListener('click', function() {
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
}

/* ================================
   DARK MODE TOGGLE
================================ */
function initDarkMode() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved ? saved === 'dark' : prefersDark;

  if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
  updateToggleIcon(toggle, isDark);

  toggle.addEventListener('click', function() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = !current;
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('theme', next ? 'dark' : 'light');
    updateToggleIcon(toggle, next);
  });
}

function updateToggleIcon(btn, isDark) {
  btn.innerHTML = isDark
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

/* ================================
   PRELOADER
================================ */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', function() {
    setTimeout(function() {
      preloader.classList.add('hide');
      preloader.addEventListener('transitionend', function() { preloader.remove(); }, { once: true });
    }, 1800);
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
   CSS TAMBAHAN – SPINNER ANIMASI
================================ */
(function() {
  const style = document.createElement('style');
  style.textContent = '@keyframes spin{to{transform:rotate(360deg)}} .spinner-icon{animation:spin 1s linear infinite;opacity:.6}';
  document.head.appendChild(style);
})();

/* ================================
   INIT (async – tunggu data Sheet)
================================ */
document.addEventListener('DOMContentLoaded', async function() {
  if (document.body.classList.contains('index-page')) {
    initDarkMode();
    initPreloader();
    initHeroCta();

    // Tampilkan animasi loading sementara fetch berjalan
    showLoadingState();

    // Ambil produk (dari Google Sheets atau fallback default)
    allProducts = await fetchProductsFromSheet();

    // Render setelah data siap
    buildFilters();
    renderProducts();

    // Update counter jumlah produk
    const el = document.getElementById('stat-products');
    if (el) el.textContent = allProducts.length;
  }
});
