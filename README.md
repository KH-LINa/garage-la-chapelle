# 🚗 Garage la Chapelle - Application Mobile Web

Application web mobile progressive (PWA-ready) pour le Garage la Chapelle, inspirée directement des designs Stitch. Interface mobile-first avec navigation bottom bar et design system cohérent.

## 📱 Aperçu

Application mobile complète avec 11 pages interconnectées, design dark mode premium basé sur le système de design Stitch.

## 🗂️ Structure des Pages

| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `index.html` | Hero, services, avis clients, actions rapides |
| Catalogue | `catalogue.html` | Pièces avec recherche, filtres, panier |
| Rendez-vous | `rendez-vous.html` | Wizard 4 étapes : service → date → infos → confirmation |
| Devis | `devis.html` | Formulaire de demande de devis gratuit |
| Contact | `contact.html` | Méthodes de contact, carte, formulaire |
| Blog | `blog.html` | Articles, conseils auto, newsletter |
| Galerie | `galerie.html` | Grille photo avec lightbox |
| Panier | `panier.html` | Gestion panier, livraison, paiement |
| Suivi commande | `suivi-commande.html` | Timeline de suivi en temps réel |
| Espace Client | `espace-client.html` | Profil, véhicules, historique, connexion |
| À Propos | `a-propos.html` | Histoire, valeurs, équipe |

## 🎨 Design System (Stitch)

- **Thème** : Dark mode exclusif
- **Couleur principale** : `#1152d4` (bleu primaire)
- **Police** : Space Grotesk (Google Fonts)
- **Bordures** : Radius 12px (round-8)
- **Navigation** : Bottom navigation bar (5 onglets)
- **Animations** : Micro-animations, transitions fluides

## 🚀 Lancement

Ouvrez simplement `index.html` dans votre navigateur. Aucun serveur requis.

Pour une expérience optimale, visualisez en mode mobile (F12 → mode device) avec une largeur de 390px.

## 📋 Fonctionnalités

- ✅ Navigation mobile fluide (bottom navbar)
- ✅ Prise de RDV interactive (wizard 4 étapes)
- ✅ Calendrier de disponibilités
- ✅ Catalogue pièces avec recherche + filtres
- ✅ Panier d'achat avec options livraison
- ✅ Suivi de commande avec timeline
- ✅ Espace client (login/profil/véhicules)
- ✅ Galerie avec lightbox
- ✅ Contact direct (téléphone, WhatsApp, email, maps)
- ✅ Blog avec articles
- ✅ Bouton WhatsApp flottant
- ✅ 100% responsive (mobile-first)

## 🛠️ Technologies

- HTML5 sémantique
- CSS3 custom properties (no framework)
- JavaScript vanilla
- Google Fonts (Space Grotesk)
- Material Symbols Outlined (Google Icons)

## 📁 Structure

```
garage-la-chapelle/
├── index.html          # Accueil
├── catalogue.html      # Catalogue pièces
├── rendez-vous.html    # Prise de RDV
├── devis.html          # Demande de devis
├── contact.html        # Contact
├── blog.html           # Blog & conseils
├── galerie.html        # Galerie photos
├── panier.html         # Panier d'achat
├── suivi-commande.html # Suivi commande
├── espace-client.html  # Espace client
├── a-propos.html       # À propos
├── blog-freins.html    # Article blog
├── blog-article.html   # Article blog
└── assets/
    └── css/
        ├── global.css
        └── mobile.css  # Design system mobile
```

---

*Projet généré à partir des designs Stitch - Garage la Chapelle*
