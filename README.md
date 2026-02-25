# 🔧 Garage la Chapelle — Site Web

Site web professionnel du **Garage la Chapelle**, expert automobile à Paris 18ème.  
Conçu à partir des maquettes [Stitch](https://stitch.google.com), optimisé mobile, prêt à déployer.

## 🌐 Pages disponibles

| Page | Fichier |
|------|---------|
| Accueil | `index.html` |
| Prise de rendez-vous | `rendez-vous.html` |
| Demande de devis | `devis.html` |
| Contact | `contact.html` |
| Catalogue de pièces | `catalogue.html` |
| Galerie photos | `galerie.html` |
| Blog & Conseils | `blog.html` |
| À Propos | `a-propos.html` |
| Suivi de commande | `suivi-commande.html` |
| Panier | `panier.html` |

## 🚀 Démarrage rapide

Ouvrez simplement `index.html` dans votre navigateur — aucune installation requise.

Pour un serveur local (recommandé) :
```bash
npx serve .
# ou
python -m http.server 8080
```

## 🎨 Stack technique

- **HTML5** sémantique
- **CSS3** vanilla (variables CSS, Grid, Flexbox, animations)
- **JavaScript** vanilla (navigation mobile responsive)
- **Police** : Space Grotesk (Google Fonts)
- **Design** : Thème sombre, couleur principale `#1152d4`

## 📱 Responsive

- ✅ Mobile (< 600px) — menu hamburger, mise en page colonne
- ✅ Tablette (600–900px) — grilles adaptatives
- ✅ Desktop (> 900px) — navigation complète

## 📁 Structure

```
garage-la-chapelle/
├── index.html              # Accueil
├── rendez-vous.html
├── devis.html
├── contact.html
├── catalogue.html
├── galerie.html
├── blog.html
├── blog-article.html       # Article : Vidange moteur
├── blog-freins.html        # Article : Entretien freins
├── a-propos.html
├── suivi-commande.html
├── panier.html
└── assets/
    ├── css/global.css      # Design system complet
    └── js/nav.js           # Navigation mobile
```

## 📞 Informations du Garage

- **Adresse** : 12 Rue de la Paix, 75018 Paris
- **Tél** : 01 23 45 67 89
- **Email** : contact@garagelachapelle.fr
- **Horaires** : Lun-Ven 8h30–19h00 / Sam 9h00–17h00

## 🌍 Déploiement

Compatible avec tout hébergeur statique :
- **GitHub Pages** (ce dépôt)
- Netlify / Vercel (drag & drop)
- OVH / Hostinger (FTP)

---
*Conçu avec [Google Stitch](https://stitch.google.com) — Design system Space Grotesk / Dark Mode*
