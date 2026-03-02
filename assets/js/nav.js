/**
 * Navigation partagée – Garage la Chapelle
 * Injecte automatiquement : top nav (desktop) + mobile header + bottom nav
 * Usage : <script src="assets/js/nav.js" data-page="home"></script>
 */
(function () {
  const pages = [
    { id: 'home', href: 'index.html', icon: 'home', label: 'Accueil' },
    { id: 'catalogue', href: 'catalogue.html', icon: 'inventory_2', label: 'Catalogue' },
    { id: 'rdv', href: 'rendez-vous.html', icon: 'calendar_month', label: 'RDV' },
    { id: 'blog', href: 'blog.html', icon: 'article', label: 'Blog' },
    { id: 'profile', href: 'espace-client.html', icon: 'person', label: 'Profil' },
  ];

  const extraLinks = [
    { href: 'devis.html', label: 'Devis' },
    { href: 'contact.html', label: 'Contact' },
    { href: 'galerie.html', label: 'Galerie' },
    { href: 'a-propos.html', label: 'À Propos' },
  ];

  // Detect current page
  const script = document.currentScript;
  const currentPage = script ? script.getAttribute('data-page') : '';
  // cart count will be handled dynamically via refreshCartBadge, ignore data-cart
  let cart = 0;

  // ── TOP NAV (desktop) ─────────────────────────────
  const topNav = document.createElement('nav');
  topNav.className = 'top-nav';
  topNav.innerHTML = `
    <a class="nav-logo" href="index.html">
      <div class="logo-icon"><span class="material-symbols-outlined">directions_car</span></div>
      <div><strong>Garage la Chapelle</strong><span class="sub">Paris 18<sup>e</sup></span></div>
    </a>
    <div class="nav-links">
      ${pages.map(p => `<a href="${p.href}" class="${currentPage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
      ${extraLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
    </div>
    <div class="nav-actions">
      <a class="cart-pill" href="panier.html">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="badge">0</span>
      </a>
      <a class="nav-btn ghost" href="contact.html">
        <span class="material-symbols-outlined">phone</span>
        Appeler
      </a>
      <a class="nav-btn primary" href="rendez-vous.html">
        <span class="material-symbols-outlined">calendar_month</span>
        Prendre RDV
      </a>
    </div>
  `;

  // ── MOBILE HEADER ─────────────────────────────────
  const mobileHeader = document.createElement('header');
  mobileHeader.className = 'mobile-header';
  const currentPageData = pages.find(p => p.id === currentPage) || pages[0];
  mobileHeader.innerHTML = `
    <a class="logo" href="index.html">
      <div class="logo-icon"><span class="material-symbols-outlined">directions_car</span></div>
      <div class="logo-text">Garage la Chapelle<span>${currentPageData ? currentPageData.label : 'Accueil'}</span></div>
    </a>
    <div class="header-actions">
      <a class="header-btn" href="panier.html">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="cart-badge">${cart}</span>
      </a>
      <a class="header-btn" href="contact.html">
        <span class="material-symbols-outlined">call</span>
      </a>
    </div>
  `;

  // ── BOTTOM NAV (mobile) ───────────────────────────
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'bottom-nav';
  bottomNav.innerHTML = pages.map(p => `
    <a class="bottom-nav-item ${currentPage === p.id ? 'active' : ''}" href="${p.href}">
      <span class="material-symbols-outlined">${p.icon}</span>
      <span class="label">${p.label}</span>
    </a>
  `).join('');

  // ── WHATSAPP FAB ──────────────────────────────────
  const fab = document.createElement('a');
  fab.className = 'fab fab-whatsapp';
  fab.href = 'https://wa.me/33123456789?text=Bonjour%20Garage%20la%20Chapelle%20!';
  fab.target = '_blank';
  fab.setAttribute('aria-label', 'WhatsApp');
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.547 4.088 1.5 5.815L.057 23.25a.5.5 0 00.611.611l5.425-1.443A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zM12 22a9.95 9.95 0 01-5.097-1.394l-.364-.216-3.77 1.002 1.002-3.77-.216-.364A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;

  // badge refresh utility (counts items in panier page)
  function refreshCartBadge() {
    let count = document.querySelectorAll('.cart-item').length;
    // persist change (including zero) so other pages see most recent value
    localStorage.setItem('cartCount', count);
    // if no items, maybe use stored anyway, but value just set
    if (count === 0) {
      const stored = parseInt(localStorage.getItem('cartCount')||'0',10);
      if (stored>0) count = stored; // unlikely since we just saved 0
    }
    document.querySelectorAll('.cart-pill .badge, .header-btn .cart-badge').forEach(b => b.textContent = count);
  }

  // ── INJECT ────────────────────────────────────────
  document.body.prepend(bottomNav);  // at end via append instead
  document.body.prepend(mobileHeader);
  document.body.prepend(topNav);
  document.body.appendChild(fab);

  // Fix: move bottom nav to END of body
  document.body.removeChild(bottomNav);
  document.body.appendChild(bottomNav);

  // update badge on initial load
  document.addEventListener('DOMContentLoaded', () => {
    // compute badge using DOM or stored count
    refreshCartBadge();
  });
})();
