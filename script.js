/* ============================================================
   PilihCerdas MEGA UPDATE — script.js
   JSON API · Skeleton Loading · Pagination · Debounce
   Lazy Load · Wishlist · Deep Link · Price Format · Haptic
   ============================================================

   CARA SETUP GOOGLE APPS SCRIPT (JSON API):
   ──────────────────────────────────────────
   1. Buka spreadsheet-mu → Extensions → Apps Script
   2. Paste kode berikut lalu Save:

      function doGet() {
        const ss    = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName('Sheet1');          // sesuaikan nama sheet
        const data  = sheet.getDataRange().getValues();
        const keys  = data[0];                              // baris pertama = header
        const rows  = data.slice(1).map(row => {
          const obj = {};
          keys.forEach((k, i) => { obj[k] = row[i]; });
          return obj;
        }).filter(r => r.id);                               // buang baris kosong
        const out = ContentService
          .createTextOutput(JSON.stringify({ products: rows }))
          .setMimeType(ContentService.MimeType.JSON);
        return out;
      }

   3. Deploy → New deployment → Web App
      - Execute as: Me
      - Who has access: Anyone
   4. Copy URL deployment → tempel di JSON_API_URL di bawah

   Header kolom spreadsheet yang diharapkan (urutan bebas):
   id | name | price | rating | description | image |
   affiliateLink | category | label | personal_review
*/

'use strict';

// ── CONFIG ──────────────────────────────────────────────────
const JSON_API_URL  = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
const PER_PAGE      = 12;        // produk per halaman
const SEARCH_DELAY  = 300;       // ms debounce pencarian
const WISHLIST_KEY  = 'pilihcerdas_wishlist_v2';

// ── FALLBACK DATA ─────────────────────────────────────────────
const FALLBACK_PRODUCTS = [
  {
    id: '1', name: "Oversized T-Shirt Premium '28 EIJ'", price: 129000, rating: '4.9',
    description: 'Kaos putih oversized cutting sempurna, bahan 30s combed cotton tebal. Anti tembus & super adem.',
    personal_review: 'Cuttingannya jatuh banget di badan, bahan adem & ga tembus. Wajib punya!',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    affiliateLink: '#', category: 'Fashion', label: 'Must Have',
  },
  {
    id: '2', name: 'Mechanical Keyboard TKL RGB Wireless', price: 299000, rating: '4.5',
    description: 'Keyboard mekanikal tenkeyless wireless. Switch blue, battery 3000mAh, RGB 16.8 juta warna.',
    personal_review: 'Bunyi kliknya renyah, ngetik kode auto ngebut. Worth it banget untuk harganya!',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80',
    affiliateLink: '#', category: 'Elektronik', label: 'Diskon Gila',
  },
  {
    id: '3', name: 'Tote Bag Canvas 12oz Aesthetic', price: 89000, rating: '4.7',
    description: 'Canvas tebal 12oz, muat laptop 14 inch. Design minimalis cocok untuk semua outfit casual.',
    personal_review: 'Udah 6 bulan dipake, ga ada tanda-tanda rusak sama sekali. Kuat banget!',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    affiliateLink: '#', category: 'Fashion', label: 'Viral',
  },
  {
    id: '4', name: 'Skincare Set Niacinamide + Moisturizer', price: 185000, rating: '4.8',
    description: 'Paket skincare pagi-malam. Niacinamide 10%+Zinc untuk pori-pori, moisturizer non-comedogenic.',
    personal_review: 'Kulit jadi glowing dalam 2 minggu, minyak berkurang drastis!',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    affiliateLink: '#', category: 'Kecantikan', label: 'Terbatas',
  },
  {
    id: '5', name: 'Lampu Belajar LED Aesthetic 3 Mode', price: 145000, rating: '4.6',
    description: 'LED meja 3 mode cahaya, 10 level intensitas, dilengkapi port USB charging di badan lampu.',
    personal_review: 'Mata ga capek walau belajar sampai subuh. Desainnya bikin meja makin estetik!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    affiliateLink: '#', category: 'Elektronik', label: 'Worth It',
  },
  {
    id: '6', name: 'Parfum Unisex Oud Vanilla EDP 30ml', price: 210000, rating: '4.9',
    description: 'EDP base note oud kayu, vanilla & musk. Tahan 8-10 jam di kulit, projection balanced.',
    personal_review: 'Banyak yang nanya pake parfum apa. Selalu dapet compliment kemana-mana!',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    affiliateLink: '#', category: 'Kecantikan', label: 'Viral',
  },
  {
    id: '7', name: 'TWS Earphone ANC Noise Cancelling', price: 399000, rating: '4.4',
    description: 'ANC aktif dengan driver 13mm, latensi 40ms untuk gaming, total battery 30 jam dengan charging case.',
    personal_review: 'ANC-nya mantap buat kerja di cafe, suara bass nendang. Saingan earphone 2x harganya!',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    affiliateLink: '#', category: 'Elektronik', label: 'Best Seller',
  },
  {
    id: '8', name: 'Tumbler Vacuum Stainless 600ml', price: 95000, rating: '4.7',
    description: 'Double wall vacuum insulation, dingin 24 jam & panas 12 jam. Bebas BPA, anti bocor, anti-slip base.',
    personal_review: 'Es batu ga mencair seharian penuh! Teman setia ngantor, gym & ngampus.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80',
    affiliateLink: '#', category: 'Lifestyle', label: 'Must Have',
  },
];

// ── STATE ────────────────────────────────────────────────────
const state = {
  products:      [],
  filteredList:  [],
  filter:        'Semua',
  search:        '',
  sort:          'default',
  page:          1,
  wishlist:      new Set(),
};

// ── UTILS ─────────────────────────────────────────────────────

/** Shorthand getElementById */
const $  = id => document.getElementById(id);

/**
 * Format harga dari number atau string mentah → "Rp 150.000"
 * Handle: 150000 | "150000" | "Rp 150.000" | "150,000"
 */
function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '–';
  const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return String(val); // kembalikan apa adanya jika parse gagal
  return 'Rp\u00A0' + num.toLocaleString('id-ID');
}

/** Extract angka dari harga */
function parsePrice(val) {
  return parseInt(String(val ?? '0').replace(/[^0-9]/g, ''), 10) || 0;
}

/** Escape HTML – cegah XSS dari data sheet */
function esc(str) {
  return (str == null ? '' : String(str))
    .replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

/** Debounce factory */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Haptic feedback via Vibration API */
function haptic(pattern = [30]) {
  try { if ('vibrate' in navigator) navigator.vibrate(pattern); } catch {}
}

/**
 * Tentukan kelas badge berdasarkan teks label.
 * Urutan pengecekan: dari yang paling spesifik ke umum.
 */
function getBadgeClass(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('terbatas') || l.includes('limited'))           return 'badge-terbatas';
  if (l.includes('diskon')   || l.includes('gila') || l.includes('sale')) return 'badge-diskon';
  if (l.includes('viral')    || l.includes('trending'))          return 'badge-viral';
  if (l.includes('must')     || l.includes('best') || l.includes('seller')) return 'badge-must';
  if (l.includes('baru')     || l.includes('new'))               return 'badge-new-item';
  return 'badge-worth';
}

// ── DATA FETCHING ─────────────────────────────────────────────

async function initData() {
  // Tampilkan skeleton dulu
  renderSkeletons(6);

  try {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(JSON_API_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    // Terima format: { products: [...] } | { data: [...] } | [...]
    const raw  = Array.isArray(json) ? json : (json.products ?? json.data ?? []);
    state.products = raw.filter(p => p && p.id);

    if (state.products.length === 0) throw new Error('empty response');

  } catch (err) {
    console.warn('[PilihCerdas] Gagal fetch API, pakai fallback. Alasan:', err.message);
    state.products = FALLBACK_PRODUCTS;
  }

  // Update hero stat
  $('total-products').textContent = state.products.length + '+';

  // Load wishlist dari localStorage
  loadWishlist();
  buildUI();
  handleHashDeepLink();
}

// ── SKELETON ──────────────────────────────────────────────────

function renderSkeletons(n) {
  $('product-grid').innerHTML = Array.from({ length: n }, () => `
    <div class="skeleton-card shimmer-wrap" aria-hidden="true">
      <div class="sk-img"></div>
      <div class="sk-body">
        <div class="sk-line sk-w30 sk-line-sm"></div>
        <div class="sk-line sk-w80 sk-line-lg"></div>
        <div class="sk-line sk-w60 sk-line-sm"></div>
        <div class="sk-line sk-w40 sk-line-sm"></div>
        <div class="sk-line sk-w60"></div>
      </div>
    </div>
  `).join('');
}

// ── BUILD UI ──────────────────────────────────────────────────

function buildUI() {
  // Render filter category pills
  const cats = ['Semua', ...new Set(state.products.map(p => p.category).filter(Boolean))];
  const pillsEl = $('filter-pills');
  pillsEl.innerHTML = cats.map(c =>
    `<button class="pill ${c === state.filter ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');

  pillsEl.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      haptic([20]);
      state.filter = btn.dataset.cat;
      state.page   = 1;
      buildUI();
    });
  });

  renderGrid();
}

// ── RENDER GRID ───────────────────────────────────────────────

function renderGrid() {
  // 1. Filter kategori
  let list = state.filter === 'Semua'
    ? [...state.products]
    : state.products.filter(p => p.category === state.filter);

  // 2. Filter pencarian
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(p =>
      [p.name, p.description, p.category, p.label, p.personal_review]
        .some(v => v != null && String(v).toLowerCase().includes(q))
    );
  }

  // 3. Sort
  const sorts = {
    'price-asc':   (a, b) => parsePrice(a.price) - parsePrice(b.price),
    'price-desc':  (a, b) => parsePrice(b.price) - parsePrice(a.price),
    'rating-desc': (a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0),
    'newest':      (a, b) => String(b.id).localeCompare(String(a.id), undefined, { numeric: true }),
  };
  if (sorts[state.sort]) list.sort(sorts[state.sort]);

  state.filteredList = list;

  // 4. Results info
  $('results-info').textContent = state.search
    ? `Ketemu ${list.length} racun buat "${state.search}"`
    : '';

  // 5. Paginasi: tampilkan hanya page pertama
  const visible   = list.slice(0, state.page * PER_PAGE);
  const remaining = list.length - visible.length;

  const grid = $('product-grid');

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span>🕵️‍♂️</span>
        <p>Kosong bosku. Coba kata kunci lain!</p>
      </div>`;
    $('load-more-wrap').style.display = 'none';
    return;
  }

  grid.innerHTML = visible.map((p, i) => buildCard(p, i)).join('');

  // 6. Load More button
  const wrap = $('load-more-wrap');
  if (remaining > 0) {
    wrap.style.display = 'flex';
    $('load-more-count').textContent = `+${remaining} produk`;
  } else {
    wrap.style.display = 'none';
  }

  // 7. Setup lazy-loading gambar
  setupLazyImages();

  // 8. Sinkronisasi status wishlist di semua tombol
  syncWishlistButtons();
}

// ── BUILD CARD HTML ───────────────────────────────────────────

function buildCard(p, idx) {
  const id          = esc(String(p.id));
  const name        = esc(String(p.name || ''));
  const price       = formatPrice(p.price);
  const rating      = esc(String(p.rating || '–'));
  const desc        = esc(String(p.description || ''));
  const review      = p.personal_review ? esc(String(p.personal_review)) : '';
  const link        = esc(String(p.affiliateLink || '#'));
  const imgSrc      = esc(String(p.image || ''));
  const label       = esc(String(p.label || 'Worth It'));
  const badgeClass  = getBadgeClass(p.label);
  const isWished    = state.wishlist.has(String(p.id));
  const heartIcon   = isWished ? '❤️' : '🤍';
  // Staggered animation delay agar kartu muncul berurutan
  const delay       = Math.min(idx * 55, 450);
  // Placeholder transparan 1x1 px – gambar asli dimuat via Intersection Observer
  const placeholder = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  return `
    <article class="product-card" id="product-${id}" role="listitem" style="animation-delay:${delay}ms">

      <div class="card-img-wrap"
           onclick="openLightbox('${imgSrc}', '${name}')"
           title="Klik untuk lihat foto lebih besar">
        <img
          class="card-img"
          data-src="${imgSrc}"
          src="${placeholder}"
          alt="${name}"
          width="600" height="220"
        >
        <button
          class="card-wishlist-btn ${isWished ? 'active' : ''}"
          data-id="${id}"
          aria-label="${isWished ? 'Hapus dari' : 'Tambah ke'} wishlist"
          onclick="event.stopPropagation(); toggleWishlist('${id}')"
        >${heartIcon}</button>
      </div>

      <div class="card-content">
        <div class="card-header">
          <span class="badge ${badgeClass}">${label}</span>
          <span class="card-rating">⭐ ${rating}</span>
        </div>

        <h3 class="product-title">${name}</h3>
        <p  class="product-desc">${desc}</p>

        ${review ? `<div class="review-box">"${review}"</div>` : ''}

        <div class="product-price">${price}</div>

        <div class="card-actions">
          <a
            href="${link}" target="_blank" rel="noopener noreferrer"
            class="btn btn-primary"
            onclick="haptic([30])"
          >🛒 Sikat!</a>
          <button class="btn btn-icon" title="Share ke WhatsApp"
            onclick="shareWA('${name}', '${link}', '${esc(price)}')">💬</button>
          <button class="btn btn-icon" title="Copy link produk"
            onclick="copyLink('${link}')">🔗</button>
          <button class="btn btn-icon" title="Share lainnya"
            onclick="shareNative('${id}', '${name}', '${link}', '${esc(price)}')">📤</button>
        </div>
      </div>
    </article>
  `;
}

// ── LOAD MORE ─────────────────────────────────────────────────

function loadMore() {
  haptic([20, 40, 20]);
  state.page++;
  renderGrid();
  // Scroll sedikit ke bawah agar smooth
  const grid = $('product-grid');
  const lastCard = grid.querySelector('.product-card:nth-last-child(' + PER_PAGE + ')');
  if (lastCard) {
    setTimeout(() => lastCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// ── LAZY LOADING (Intersection Observer) ──────────────────────

let _lazyObserver = null;

function setupLazyImages() {
  if (_lazyObserver) _lazyObserver.disconnect();

  _lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;

      // Muat gambar asli
      img.src = src;
      img.addEventListener('load',  () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => {
        img.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
        img.classList.add('loaded');
      }, { once: true });

      delete img.dataset.src;
      _lazyObserver.unobserve(img);
    });
  }, {
    rootMargin: '120px 0px',  // mulai load sebelum masuk viewport
    threshold:  0.01,
  });

  document.querySelectorAll('.card-img[data-src]').forEach(img => _lazyObserver.observe(img));
}

// ── WISHLIST ──────────────────────────────────────────────────

function loadWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    state.wishlist = new Set(Array.isArray(saved) ? saved.map(String) : []);
  } catch {
    state.wishlist = new Set();
  }
  refreshWishlistCount();
}

function saveWishlist() {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify([...state.wishlist]));
  } catch { /* localStorage penuh atau disabled */ }
}

function toggleWishlist(id) {
  haptic([50]);
  const sid = String(id);

  if (state.wishlist.has(sid)) {
    state.wishlist.delete(sid);
    showToast('Dihapus dari wishlist 💔', 'heart');
  } else {
    state.wishlist.add(sid);
    showToast('Ditambah ke wishlist ❤️', 'heart');
  }

  saveWishlist();
  refreshWishlistCount();
  syncWishlistButtons();

  // Animasi bounce pada tombol yang diklik
  const btn = document.querySelector(`.card-wishlist-btn[data-id="${CSS.escape(sid)}"]`);
  if (btn) {
    btn.innerHTML = state.wishlist.has(sid) ? '❤️' : '🤍';
    btn.classList.toggle('active', state.wishlist.has(sid));
    btn.style.transform = 'scale(1.5)';
    setTimeout(() => { btn.style.transform = ''; }, 220);
  }

  // Refresh drawer jika sedang terbuka
  if ($('wishlist-panel').classList.contains('open')) renderWishlistDrawer();
}

function syncWishlistButtons() {
  document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
    const id = String(btn.dataset.id);
    const wished = state.wishlist.has(id);
    btn.classList.toggle('active', wished);
    btn.innerHTML = wished ? '❤️' : '🤍';
  });
}

function refreshWishlistCount() {
  const n     = state.wishlist.size;
  const badge = $('wishlist-count');
  badge.textContent  = n;
  badge.style.display = n > 0 ? 'flex' : 'none';
}

function openWishlistPanel() {
  renderWishlistDrawer();
  $('wishlist-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWishlistPanel() {
  $('wishlist-panel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderWishlistDrawer() {
  const items = state.products.filter(p => state.wishlist.has(String(p.id)));
  const cont  = $('wishlist-items');

  if (items.length === 0) {
    cont.innerHTML = `
      <div class="wishlist-empty">
        <span>🤍</span>
        <p>Wishlist kamu masih kosong.<br>Tap ikon hati di produk untuk menyimpan!</p>
      </div>`;
    return;
  }

  cont.innerHTML = items.map(p => `
    <div class="wishlist-item">
      <img
        src="${esc(String(p.image || ''))}"
        alt="${esc(String(p.name))}"
        onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&q=60'"
        loading="lazy"
      >
      <div class="wishlist-item-info">
        <div class="wishlist-item-name">${esc(String(p.name))}</div>
        <div class="wishlist-item-price">${formatPrice(p.price)}</div>
      </div>
      <button
        class="wishlist-item-remove"
        title="Hapus dari wishlist"
        onclick="toggleWishlist('${esc(String(p.id))}')"
      >✕</button>
    </div>
  `).join('');
}

// ── LIGHTBOX ──────────────────────────────────────────────────

function openLightbox(src, name) {
  haptic([15]);
  if (!src || src === '#') return;
  $('lightbox-img').src = src;
  $('lightbox-img').alt = name;
  $('lightbox-caption').textContent = name;
  $('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  $('lightbox').classList.remove('open');
  // Bersihkan src setelah animasi selesai agar tidak flash
  setTimeout(() => { if (!$('lightbox').classList.contains('open')) $('lightbox-img').src = ''; }, 350);
  document.body.style.overflow = '';
}

// ── DEEP LINKING (URL Hash) ───────────────────────────────────
/*
  Cara kerja:
  - Buka domain.com/#5  → langsung scroll ke produk id=5 dan highlight
  - Buka domain.com/#tumblr → auto-isi search dengan "tumblr"
*/

function handleHashDeepLink() {
  const hash = decodeURIComponent(window.location.hash.replace('#', '').trim());
  if (!hash) return;

  // Coba cari produk dengan ID persis
  const byId = document.getElementById(`product-${hash}`);
  if (byId) {
    setTimeout(() => {
      byId.scrollIntoView({ behavior: 'smooth', block: 'center' });
      byId.style.transition = 'box-shadow 0.5s ease';
      byId.style.boxShadow  = '0 0 0 3px var(--accent), 0 20px 40px var(--accent-glow)';
      setTimeout(() => { byId.style.boxShadow = ''; }, 3500);
    }, 500);
    return;
  }

  // Coba load more lalu cari lagi
  const product = state.products.find(p => String(p.id) === hash);
  if (product) {
    // Produk ada tapi belum di-render (masih di halaman berikutnya)
    state.page = Math.ceil(
      (state.filteredList.findIndex(p => String(p.id) === hash) + 1) / PER_PAGE
    );
    renderGrid();
    setTimeout(() => handleHashDeepLink(), 300);
    return;
  }

  // Fallback: jadikan hash sebagai query pencarian
  state.search          = hash;
  $('search-input').value = hash;
  $('clear-search').style.display = 'block';
  state.page            = 1;
  renderGrid();
}

// ── SHARE ─────────────────────────────────────────────────────

function shareWA(name, link, price) {
  haptic([30]);
  const msg = [
    `🔥 *Racun parah, jangan dibuka kalau ga mau beli!*`,
    ``,
    `*${name}*`,
    `💰 ${price}`,
    ``,
    `🛒 Sikat langsung: ${link}`,
    ``,
    `✨ Temukan rekomendasi lainnya di *PilihCerdas by Xnovaa*`,
  ].join('\n');
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

/**
 * Share native (Web Share API) — fallback ke copy link produk + hash.
 * Hash URL memungkinkan penerima langsung scroll ke produk tersebut.
 */
function shareNative(id, name, link, price) {
  haptic([20]);
  const deepLink = `${window.location.origin}${window.location.pathname}#${id}`;
  const shareData = {
    title: `${name} — PilihCerdas`,
    text:  `Cek ini: ${name} | ${price} 🔥`,
    url:   deepLink,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(err => {
      if (err.name !== 'AbortError') copyLink(deepLink);
    });
  } else {
    copyLink(deepLink);
  }
}

function copyLink(link) {
  haptic([20]);
  const fallback = () => {
    try {
      const ta  = document.createElement('textarea');
      ta.value  = link;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Link disalin ke clipboard! 🔗', 'success');
    } catch { showToast('Gagal menyalin link 😢', 'info'); }
  };

  if (navigator.clipboard) {
    navigator.clipboard.writeText(link)
      .then(()  => showToast('Link disalin ke clipboard! 🔗', 'success'))
      .catch(()  => fallback());
  } else {
    fallback();
  }
}

// ── TOAST ─────────────────────────────────────────────────────

let _toastTimer = null;

function showToast(msg, type = 'info') {
  const el   = $('toast');
  el.textContent = msg;
  el.className   = `toast toast-${type} show`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── EVENT LISTENERS ───────────────────────────────────────────

// Search dengan debounce 300ms
const onSearch = debounce(val => {
  state.search = val;
  state.page   = 1;
  renderGrid();
}, SEARCH_DELAY);

$('search-input').addEventListener('input', e => {
  const val = e.target.value;
  $('clear-search').style.display = val ? 'block' : 'none';
  onSearch(val);
});

$('clear-search').addEventListener('click', () => {
  $('search-input').value = '';
  $('clear-search').style.display = 'none';
  state.search = '';
  state.page   = 1;
  renderGrid();
  $('search-input').focus();
  // Hapus hash dari URL jika ada
  history.replaceState(null, '', window.location.pathname);
});

$('sort-select').addEventListener('change', e => {
  state.sort = e.target.value;
  state.page = 1;
  renderGrid();
});

$('theme-btn').addEventListener('click', () => {
  haptic([20]);
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
});

$('wishlist-btn').addEventListener('click', () => {
  haptic([30]);
  openWishlistPanel();
});

$('close-wishlist').addEventListener('click', closeWishlistPanel);
$('wishlist-overlay').addEventListener('click', closeWishlistPanel);

$('load-more-btn').addEventListener('click', loadMore);

$('lightbox-close').addEventListener('click', closeLightbox);
$('lightbox-overlay').addEventListener('click', closeLightbox);

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeWishlistPanel(); }
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    $('search-input').focus();
  }
});

window.addEventListener('hashchange', handleHashDeepLink);

// Expose ke global scope (dipanggil dari onclick di HTML)
window.haptic       = haptic;
window.openLightbox = openLightbox;
window.toggleWishlist = toggleWishlist;
window.shareWA      = shareWA;
window.shareNative  = shareNative;
window.copyLink     = copyLink;

// ── BOOT ──────────────────────────────────────────────────────
initData();
