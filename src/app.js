// ══════════════════════════════════════════
//  WANUZA — App JavaScript
//  Puro JS, sem dependências externas
// ══════════════════════════════════════════

// ── CONFIGURAÇÃO ─────────────────────────
const WHATSAPP_NUMBER = '5592992555260';

// ── DADOS DOS PRODUTOS ────────────────────
const PRODUCTS = [
  { id: 1, name: 'Toalhas de Mesa',   price: 35.00, category: 'cozinha',  img: './produtos/toalhas-de-mesa.jpg',   emoji: '🧶', bg: 'linear-gradient(135deg, #FFE0D3 0%, #FBBCAB 100%)' },
  { id: 2, name: 'Tapetes de Crochê', price: 89.99, category: 'casa',     img: './produtos/tapetes-de-crouche.jpg', emoji: '🏡', bg: 'linear-gradient(135deg, #D3FFE8 0%, #A8EDCA 100%)' },
  { id: 3, name: 'Tocas de Crochê',   price: 30.00, category: 'pessoal',  img: './produtos/tocas-de-crouche.jpg',  emoji: '🎀', bg: 'linear-gradient(135deg, #FFD3E8 0%, #FBA8CA 100%)' },
  { id: 4, name: 'Capas de Almofada', price: 45.00, category: 'quarto',   img: './produtos/capas-de-almofada.jpg', emoji: '🛏️', bg: 'linear-gradient(135deg, #E8D3FF 0%, #CAA8FA 100%)' },
  { id: 5, name: 'Suporte de Vaso',   price: 39.90, category: 'casa',     img: './produtos/suporte-de-vaso.jpg',   emoji: '🌿', bg: 'linear-gradient(135deg, #D3E8FF 0%, #A8CAFA 100%)' },
  { id: 6, name: 'Bolsas de Crochê',  price: 59.99, category: 'pessoal',  img: './produtos/bolsas-de-crouche.jpg', emoji: '👜', bg: 'linear-gradient(135deg, #FFE8D3 0%, #FACAAA 100%)' },
  { id: 7, name: 'Porta-Utensílios',  price: 28.90, category: 'cozinha',  img: './produtos/porta-utensilios.jpg',  emoji: '🍳', bg: 'linear-gradient(135deg, #FFF3D3 0%, #FAE0A8 100%)' },
  { id: 8, name: 'Xale de Crochê',    price: 79.99, category: 'pessoal',  img: './produtos/xale-de-crouche.jpg',   emoji: '🧣', bg: 'linear-gradient(135deg, #FFD3D3 0%, #FAA8A8 100%)' },
];

// ── ESTADO ────────────────────────────────
let cart = [];
let currentFilter = 'all';
let searchTerm = '';
let currentSlide = 0;
let slideTimer = null;
let isDark = false;
let toastTimer = null;

// ── INICIALIZAÇÃO ─────────────────────────
init();

function init() {
  loadTheme();
  renderProducts();
  setupCarousel();
  setupSearch();
  setupCart();
  setupSidebar();
  setupThemeToggle();
  setupNavCart();
  loadCart();
  setupFeaturedBtn();
  setupNavObserver();
  setupLightbox();
}

// ── TEMA ──────────────────────────────────
function loadTheme() {
  const saved = localStorage.getItem('wanuza-theme');
  isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', isDark ? '#1C1C1C' : '#FF5722');
}

function toggleTheme() {
  isDark = !isDark;
  applyTheme();
  localStorage.setItem('wanuza-theme', isDark ? 'dark' : 'light');
}

function setupThemeToggle() {
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('themeToggleSidebar')?.addEventListener('click', () => {
    toggleTheme();
    closeSidebar();
  });
}

// ── PRODUTOS ──────────────────────────────
function renderProducts(filter = currentFilter, search = searchTerm) {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const titleEl = document.getElementById('productsTitle');

  let filtered = PRODUCTS;

  if (filter !== 'all') {
    filtered = filtered.filter(p => p.category === filter);
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
  }

  grid.innerHTML = '';

  const catNames = { all: 'Produtos', cozinha: 'Cozinha', quarto: 'Quarto', casa: 'Casa', pessoal: 'Pessoal' };
  if (titleEl) titleEl.textContent = catNames[filter] || 'Produtos';

  if (filtered.length === 0) {
    emptyState.removeAttribute('hidden');
    return;
  }

  emptyState.setAttribute('hidden', '');

  filtered.forEach((product, index) => {
    const inCart = cart.find(i => i.id === product.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 50}ms`;
    card.innerHTML = `
      <div class="product-img-wrap" role="button" tabindex="0" aria-label="Ver imagem ampliada de ${product.name}">
        <img
          class="product-img-real"
          src="${product.img}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="product-img-fallback" style="background:${product.bg};display:none" aria-hidden="true">${product.emoji}</div>
        <div class="product-img-zoom-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </div>
      </div>
      <div class="product-info">
        <p class="product-name" title="${product.name}">${product.name}</p>
        <div class="product-footer">
          <span class="product-price">R$&nbsp;${product.price.toFixed(2).replace('.', ',')}</span>
          <button class="product-cart-btn${inCart ? ' added' : ''}"
            aria-label="Adicionar ${product.name} ao carrinho"
            data-product-id="${product.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              ${inCart
                ? '<polyline points="20 6 9 17 4 12"/>'
                : '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>'}
            </svg>
          </button>
        </div>
      </div>
    `;
    card.querySelector('.product-img-wrap').addEventListener('click', () => openLightbox(product));
    card.querySelector('.product-img-wrap').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(product); });
    card.querySelector('.product-cart-btn').addEventListener('click', e => { e.stopPropagation(); addToCart(product.id); });
    grid.appendChild(card);
  });
}

function filterProducts(category) {
  currentFilter = category;
  searchTerm = '';

  const input = document.getElementById('searchInput');
  if (input) input.value = '';

  const clearBtn = document.getElementById('searchClear');
  if (clearBtn) clearBtn.hidden = true;

  document.querySelectorAll('.cat-btn').forEach(btn => {
    const active = btn.dataset.cat === category;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  renderProducts(category, '');
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── BUSCA ─────────────────────────────────
function setupSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  if (!input) return;

  input.addEventListener('input', () => {
    searchTerm = input.value;
    clearBtn.hidden = !searchTerm;
    renderProducts(currentFilter, searchTerm);
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    searchTerm = '';
    clearBtn.hidden = true;
    renderProducts(currentFilter, '');
    input.focus();
  });
}

// ── CARRINHO ──────────────────────────────
function loadCart() {
  try {
    const saved = localStorage.getItem('wanuza-cart');
    if (saved) cart = JSON.parse(saved);
  } catch {
    cart = [];
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('wanuza-cart', JSON.stringify(cart));
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
    showToast(`+1 ${product.name}`);
  } else {
    cart.push({ ...product, qty: 1 });
    showToast(`${product.emoji} ${product.name} adicionado!`);
  }

  saveCart();
  updateCartUI();
  renderProducts();

  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease' });
  }
}

function increaseQty(productId) {
  const item = cart.find(i => i.id === productId);
  if (item) { item.qty += 1; saveCart(); updateCartUI(); renderCartPanel(); }
}

function decreaseQty(productId) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    cart = cart.filter(i => i.id !== productId);
    renderProducts();
  }
  saveCart();
  updateCartUI();
  renderCartPanel();
}

function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = total;
    badge.setAttribute('data-count', total);
    badge.style.display = total > 0 ? '' : 'none';
  }
  const navCount = document.getElementById('navCartCount');
  if (navCount) navCount.textContent = total;
}

function renderCartPanel() {
  const list = document.getElementById('cartList');
  const empty = document.getElementById('cartEmpty');
  const footer = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  if (!list) return;

  list.innerHTML = '';

  if (cart.length === 0) {
    empty.style.display = '';
    footer.hidden = true;
    return;
  }

  empty.style.display = 'none';
  footer.hidden = false;

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <div class="cart-item-img" style="background:${item.bg}" aria-hidden="true">${item.emoji}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">R$&nbsp;${(item.price * item.qty).toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Diminuir quantidade">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Aumentar quantidade">+</button>
      </div>
    `;
    li.querySelector('[data-action="decrease"]').addEventListener('click', () => decreaseQty(item.id));
    li.querySelector('[data-action="increase"]').addEventListener('click', () => increaseQty(item.id));
    list.appendChild(li);
  });

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (subtotalEl) subtotalEl.textContent = `R$\u00a0${subtotal.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.textContent = `R$\u00a0${subtotal.toFixed(2).replace('.', ',')}`;
}

function setupCart() {
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('whatsappBtn')?.addEventListener('click', goToWhatsApp);
  document.getElementById('cartEmptyBtn')?.addEventListener('click', closeCart);
}

function setupNavCart() {
  document.getElementById('navCartBtn')?.addEventListener('click', openCart);
}

function openCart() {
  renderCartPanel();
  document.getElementById('cartPanel')?.classList.add('open');
  document.getElementById('cartPanel')?.setAttribute('aria-hidden', 'false');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartPanel')?.classList.remove('open');
  document.getElementById('cartPanel')?.setAttribute('aria-hidden', 'true');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function goToWhatsApp() {
  if (cart.length === 0) return;

  const items = cart.map(i =>
    `• ${i.name} (x${i.qty}) — R$ ${(i.price * i.qty).toFixed(2).replace('.', ',')}`
  ).join('\n');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const message = encodeURIComponent(
    `Olá! Gostaria de fazer um pedido na Wanuza 🧶\n\n` +
    `*Meu pedido:*\n${items}\n\n` +
    `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\n` +
    `Aguardo retorno para confirmar o pedido e combinar a entrega. Obrigada! 💕`
  );

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

// ── CAROUSEL ──────────────────────────────
function setupCarousel() {
  const track = document.getElementById('carouselTrack');

  document.getElementById('prevBtn')?.addEventListener('click', () => { goToSlide(currentSlide - 1); resetTimer(); });
  document.getElementById('nextBtn')?.addEventListener('click', () => { goToSlide(currentSlide + 1); resetTimer(); });

  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.index)); resetTimer(); });
  });

  if (track) {
    let startX = 0, startY = 0, dragging = false;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
        resetTimer();
      }
    }, { passive: true });
  }

  startTimer();
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const track = document.getElementById('carouselTrack');
  if (!slides.length) return;
  currentSlide = ((index % slides.length) + slides.length) % slides.length;
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}

function startTimer() { slideTimer = setInterval(() => goToSlide(currentSlide + 1), 4500); }
function resetTimer() { clearInterval(slideTimer); startTimer(); }

// ── SIDEBAR ───────────────────────────────
function setupSidebar() {
  document.getElementById('menuBtn')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  document.getElementById('overlay')?.addEventListener('click', closeSidebar);
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebar')?.setAttribute('aria-hidden', 'false');
  document.getElementById('overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar')?.setAttribute('aria-hidden', 'true');
  document.getElementById('overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ── NAVIGATION ────────────────────────────
function navTo(sectionId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === sectionId);
  });
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNavObserver() {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const mapping = { categories: 'categories', products: 'products', about: 'about' };
        const navId = mapping[entry.target.id];
        if (navId) {
          document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === navId);
          });
        }
      }
    });
  }, { threshold: 0.4, rootMargin: '-60px 0px -40% 0px' });

  ['categories', 'products', 'about'].forEach(id => {
    const el = document.getElementById(id);
    if (el) navObserver.observe(el);
  });

  // Nav button click handlers
  document.querySelectorAll('.nav-btn[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navTo(btn.dataset.nav));
  });
}

// ── FEATURED CARD ─────────────────────────
function setupFeaturedBtn() {
  document.querySelector('.featured-add-btn')?.addEventListener('click', () => addToCart(1));
}

// ── TOAST ─────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ── LIGHTBOX ──────────────────────────────
function openLightbox(product) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  lb.querySelector('.lb-img').src = product.img;
  lb.querySelector('.lb-img').alt = product.name;
  lb.querySelector('.lb-name').textContent = product.name;
  lb.querySelector('.lb-price').textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
  lb.querySelector('.lb-add-btn').onclick = () => { addToCart(product.id); closeLightbox(); };

  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lb.querySelector('.lb-img').focus();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setupLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.querySelector('.lb-close')?.addEventListener('click', closeLightbox);
  lb.querySelector('.lb-backdrop')?.addEventListener('click', closeLightbox);
}

// ── KEYBOARD ──────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('lightbox')?.classList.contains('open')) closeLightbox();
    else if (document.getElementById('cartPanel')?.classList.contains('open')) closeCart();
    else if (document.getElementById('sidebar')?.classList.contains('open')) closeSidebar();
  }
});

// ── REDUCED MOTION ────────────────────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition', '0ms');
  document.documentElement.style.setProperty('--transition-slow', '0ms');
}


// ── EXPOSE GLOBALS (for inline onclick handlers) ──
Object.assign(window, {
  filterProducts,
  navTo,
  addToCart,
  openCart,
  closeCart,
  openSidebar,
  closeSidebar,
  openLightbox,
  closeLightbox,
});
