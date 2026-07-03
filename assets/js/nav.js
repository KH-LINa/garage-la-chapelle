/**
 * Navigation & utilitaires partagés — Garage de la Chapelle
 * Injecte : top nav (desktop), header + bottom nav (mobile), footer, FAB WhatsApp.
 * Expose window.GLC : infos du garage + gestion du panier (localStorage).
 * Usage : <script src="assets/js/nav.js" data-page="home"></script>
 */
(function () {
  'use strict';

  // ── INFOS DU GARAGE (à modifier ici, répercuté partout) ──
  const INFO = {
    name: 'Garage de la Chapelle',
    city: 'Ingré · Loiret',
    address: '164 Rte de la Chapelle, 45140 Ingré',
    phone: '02 38 00 00 00',
    phoneHref: 'tel:+33238000000',
    whatsapp: 'https://wa.me/33238000000?text=Bonjour%20Garage%20de%20la%20Chapelle%20!',
    email: 'contact@garage-delachapelle.fr',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=164+Route+de+la+Chapelle+45140+Ingr%C3%A9',
    hours: 'Lun–Ven 8h–19h · Sam 8h–17h',
  };

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

  const script = document.currentScript;
  const currentPage = script ? script.getAttribute('data-page') : '';

  // ── PANIER (source de vérité : localStorage 'glc_cart') ──
  const CART_KEY = 'glc_cart';

  function getCart() {
    try {
      const c = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(c) ? c : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    refreshBadge();
  }

  function cartCount() {
    return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.ref === product.ref);
    if (existing) existing.qty += 1;
    else cart.push(Object.assign({ qty: 1 }, product));
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function refreshBadge() {
    const count = cartCount();
    document.querySelectorAll('.cart-pill .badge, .header-btn .cart-badge').forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? '' : 'none';
    });
  }

  function parsePrice(text) {
    return parseFloat(String(text).replace(/[^0-9,\.]/g, '').replace(',', '.')) || 0;
  }

  function formatPrice(num) {
    return num.toFixed(2).replace('.', ',');
  }

  // ── UTILISATEUR & VÉHICULES (démo, localStorage) ──
  const USER_KEY = 'glc_user';
  const VEHICLES_KEY = 'glc_vehicles';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }

  function getVehicles() {
    try {
      const v = JSON.parse(localStorage.getItem(VEHICLES_KEY) || 'null');
      if (Array.isArray(v)) return v;
    } catch (e) { /* ignore */ }
    // parc de démonstration au premier passage
    const demo = [
      { brand: 'Peugeot', model: '208', year: '2019', plate: 'AA-123-BB', km: '54 000', lastService: 'Révision générale · 12/03/2025' },
      { brand: 'Renault', model: 'Clio IV', year: '2016', plate: 'EF-456-GH', km: '98 000', lastService: 'Vidange · 10/11/2024' },
    ];
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(demo));
    return demo;
  }
  function saveVehicles(vehicles) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
  }

  window.GLC = {
    INFO, getCart, saveCart, cartCount, addToCart, clearCart, refreshBadge,
    parsePrice, formatPrice, getUser, setUser, getVehicles, saveVehicles
  };

  // ── TOP NAV (desktop) ─────────────────────────────
  const topNav = document.createElement('nav');
  topNav.className = 'top-nav';
  topNav.innerHTML = `
    <a class="nav-logo" href="index.html">
      <div class="logo-icon"><span class="material-symbols-outlined">directions_car</span></div>
      <div><strong>${INFO.name}</strong><span class="sub">${INFO.city}</span></div>
    </a>
    <div class="nav-links">
      ${pages.map(p => `<a href="${p.href}" class="${currentPage === p.id ? 'active' : ''}">${p.label}</a>`).join('')}
      ${extraLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
    </div>
    <div class="nav-actions">
      <a class="cart-pill" href="panier.html" aria-label="Panier">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="badge">0</span>
      </a>
      <a class="nav-btn ghost" href="${INFO.phoneHref}">
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
  const currentPageData = pages.find(p => p.id === currentPage);
  mobileHeader.innerHTML = `
    <a class="logo" href="index.html">
      <div class="logo-icon"><span class="material-symbols-outlined">directions_car</span></div>
      <div class="logo-text">${INFO.name}<span>${currentPageData ? currentPageData.label : INFO.city}</span></div>
    </a>
    <div class="header-actions">
      <a class="header-btn" href="panier.html" aria-label="Panier">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="cart-badge">0</span>
      </a>
      <a class="header-btn" href="${INFO.phoneHref}" aria-label="Appeler">
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

  // ── FOOTER ────────────────────────────────────────
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="nav-logo" href="index.html">
          <div class="logo-icon"><span class="material-symbols-outlined">directions_car</span></div>
          <div><strong>${INFO.name}</strong><span class="sub">${INFO.city}</span></div>
        </a>
        <p>Votre garage de confiance à Ingré, près d'Orléans. Entretien, réparation et pièces détachées toutes marques.</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <a href="index.html">Accueil</a>
        <a href="catalogue.html">Catalogue pièces</a>
        <a href="galerie.html">Galerie</a>
        <a href="blog.html">Blog &amp; conseils</a>
        <a href="a-propos.html">À propos</a>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="rendez-vous.html">Prendre rendez-vous</a>
        <a href="devis.html">Devis gratuit</a>
        <a href="suivi-commande.html">Suivi de commande</a>
        <a href="espace-client.html">Espace client</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="${INFO.mapsUrl}" target="_blank" rel="noopener"><span class="material-symbols-outlined">location_on</span>${INFO.address}</a>
        <a href="${INFO.phoneHref}"><span class="material-symbols-outlined">call</span>${INFO.phone}</a>
        <a href="mailto:${INFO.email}"><span class="material-symbols-outlined">mail</span>${INFO.email}</a>
        <span class="footer-hours"><span class="material-symbols-outlined">schedule</span>${INFO.hours}</span>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} ${INFO.name} — Tous droits réservés.</p>
      <div class="footer-links"><a href="contact.html">Mentions légales</a><a href="contact.html">Confidentialité</a><a href="admin.html">Espace Pro</a></div>
    </div>
  `;

  // ── WHATSAPP FAB ──────────────────────────────────
  const fab = document.createElement('a');
  fab.className = 'fab fab-whatsapp';
  fab.href = INFO.whatsapp;
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.setAttribute('aria-label', 'WhatsApp');
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.547 4.088 1.5 5.815L.057 23.25a.5.5 0 00.611.611l5.425-1.443A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zM12 22a9.95 9.95 0 01-5.097-1.394l-.364-.216-3.77 1.002 1.002-3.77-.216-.364A9.95 9.95 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>`;

  // ── INJECTION ─────────────────────────────────────
  // Le script s'exécute en début de <body> : les headers peuvent être insérés
  // tout de suite, mais le footer (en flux) doit attendre la fin du parsing.
  document.body.prepend(mobileHeader);
  document.body.prepend(topNav);
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(footer);
    document.body.appendChild(fab);
    document.body.appendChild(bottomNav);
    refreshBadge();
  });

  // Badge à jour au retour depuis le bfcache et entre onglets
  window.addEventListener('pageshow', refreshBadge);
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY) refreshBadge(); });
  refreshBadge();
})();
