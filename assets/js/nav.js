// ---- TAWK.TO LIVE CHAT ----
// 👉 Remplace VOTRE_PROPERTY_ID et VOTRE_WIDGET_ID par tes clés Tawk.to
//    1. Crée un compte gratuit sur https://tawk.to
//    2. Ajoute ton site web → copie le Property ID et Widget/Chat ID
//    3. Colle-les ci-dessous
(function () {
  var Tawk_API = window.Tawk_API || {};
  var Tawk_LoadStart = new Date();
  var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/VOTRE_PROPERTY_ID/VOTRE_WIDGET_ID';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);

  // Personnalisation du widget
  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_API.onLoad = function () {
    window.Tawk_API.setAttributes({
      'name': 'Visiteur Garage la Chapelle',
      'email': ''
    }, function (error) { });
    // Message de bienvenue personnalisé
    window.Tawk_API.customStyle = {
      zIndex: 9000  // Sous le bouton WhatsApp (z-index: 9999)
    };
  };
})();

// Navigation mobile toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      drawer.classList.toggle('open');
      document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    });
    // Close on link click
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll -> navbar shadow
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,.5)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // ---- BOUTON WHATSAPP FLOTTANT ----
  const waBtn = document.createElement('a');
  waBtn.href = 'https://wa.me/33612345678?text=Bonjour%20Garage%20la%20Chapelle%2C%20je%20souhaite%20un%20renseignement.';
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.id = 'whatsapp-btn';
  waBtn.setAttribute('aria-label', 'Contacter sur WhatsApp');
  waBtn.innerHTML = `
      <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1C7.73 1 1 7.73 1 16c0 2.67.69 5.18 1.9 7.36L1 31l7.87-1.87A15 15 0 0 0 16 31c8.27 0 15-6.73 15-15S24.27 1 16 1zm7.56 21.44c-.31.87-1.82 1.66-2.52 1.76-.66.09-1.49.13-2.4-.15a22.1 22.1 0 0 1-2.17-.8c-3.82-1.65-6.32-5.5-6.51-5.76-.18-.26-1.5-2-.1-3.76a2.33 2.33 0 0 1 1.67-.78c.2 0 .38.01.54.02.48.02.72.04.04 1.03-.86 1.2-.67 2.33-.47 2.74.2.4 1.59 2.62 3.91 3.58.55.23 .98.37 1.31.47.55.17 1.05.15 1.45.09.44-.07 1.36-.56 1.55-1.1.19-.54.19-.99.13-1.09-.06-.09-.22-.15-.46-.26-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.63-1.17-1.4-1.31-1.64-.14-.24-.01-.37.1-.49.11-.1.24-.27.36-.41.12-.13.16-.23.24-.39.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.79z"/>
      </svg>
      <span>WhatsApp</span>`;
  document.body.appendChild(waBtn);

  // Style dynamique du bouton WhatsApp
  const style = document.createElement('style');
  style.textContent = `
      #whatsapp-btn {
        position: fixed;
        bottom: 28px;
        right: 28px;
        z-index: 9999;
        background: #25d366;
        color: #fff;
        border-radius: 50px;
        padding: 12px 20px 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        font-family: 'Space Grotesk', sans-serif;
        font-size: .88rem;
        font-weight: 600;
        box-shadow: 0 4px 20px rgba(37,211,102,.45);
        transition: transform .25s ease, box-shadow .25s ease;
      }
      #whatsapp-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 28px rgba(37,211,102,.6);
      }
      #whatsapp-btn span { white-space: nowrap; }
      @media (max-width: 600px) {
        #whatsapp-btn span { display: none; }
        #whatsapp-btn { padding: 13px; border-radius: 50%; }
      }
    `;
  document.head.appendChild(style);

  // ---- BADGE PANIER (navbar) ----
  updateCartBadge();
});

// Mise à jour du badge panier dans la navbar
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('glc_cart') || '[]');
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

