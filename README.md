# 🚗 Garage de la Chapelle — Site web

Site web complet pour le **Garage de la Chapelle** — 164 Rte de la Chapelle, 45140 Ingré (près d'Orléans).
Site statique responsive (mobile **et** desktop), dark mode premium, sans framework ni backend.

## 🚀 Lancement

Ouvrez simplement `index.html` dans votre navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## 🗂️ Pages

| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `index.html` | Hero, services, avis clients, actions rapides, SEO (JSON-LD) |
| Catalogue | `catalogue.html` | 12 pièces, recherche, filtres par catégorie, ajout au panier |
| Panier | `panier.html` | Panier persistant (localStorage), livraison, codes promo, commande |
| Confirmation | `confirmation-commande.html` | Récapitulatif de commande |
| Suivi commande | `suivi-commande.html` | Timeline de suivi, affiche la dernière commande passée |
| Rendez-vous | `rendez-vous.html` | Wizard 4 étapes avec calendrier dynamique (dimanches fermés) |
| Mes rendez-vous | `mes-rendez-vous.html` | Liste + annulation des RDV pris |
| Devis | `devis.html` | Formulaire de demande de devis gratuit |
| Contact | `contact.html` | Téléphone, WhatsApp, email, carte Google Maps (Ingré) |
| Blog | `blog.html` | Articles et conseils auto |
| Articles | `blog-freins.html`, `blog-article.html` | Articles détaillés |
| Galerie | `galerie.html` | Grille photo avec filtres et lightbox |
| Espace client | `espace-client.html` | Connexion (démo), profil, raccourcis, véhicules |
| Connexion | `compte.html`, `creer-profil.html` | Connexion / inscription (démo) |
| Mes véhicules | `mes-vehicules.html` | Parc de véhicules persistant + `ajouter-vehicule.html` |
| À propos | `a-propos.html` | Histoire, valeurs, équipe |

## 🎨 Design system

- **Thème** : dark mode (`#101622`), couleur principale `#1152d4`
- **Police** : Space Grotesk (Google Fonts) · Icônes : Material Symbols
- **Navigation** : top nav (desktop) + bottom bar 5 onglets (mobile) + footer, injectés par `assets/js/nav.js`
- **Images** : SVG locaux dans `assets/img/` (aucune dépendance à des images distantes)
- **PWA-ready** : `manifest.webmanifest` + favicon SVG + theme-color

## ⚙️ Fonctionnement

Tout l'état vit dans le `localStorage` du navigateur (site de démonstration, aucun backend) :

| Clé | Contenu |
|-----|---------|
| `glc_cart` | Articles du panier `{name, ref, price, img, qty}` |
| `glc_lastOrder` | Dernière commande passée (affichée sur le suivi) |
| `glc_user` | Utilisateur « connecté » (démo) |
| `glc_vehicles` | Véhicules du client |
| `appointments` | Rendez-vous pris via le wizard |

L'objet global `GLC` (défini dans `assets/js/nav.js`) centralise les coordonnées du garage
et les helpers panier/utilisateur/véhicules. **Pour changer l'adresse, le téléphone, l'email
ou les horaires : modifiez uniquement le bloc `INFO` en tête de `assets/js/nav.js`**
(le footer, les navs et le bouton WhatsApp se mettent à jour partout).

## ⚠️ À personnaliser avant mise en production

- **Téléphone** : `02 38 00 00 00` est un numéro fictif → remplacer dans `assets/js/nav.js`
  (bloc `INFO`) et rechercher/remplacer `02 38 00 00 00` + `33238000000` dans les pages.
- **Email** : `contact@garage-delachapelle.fr` est un exemple.
- **Formulaires** (devis, contact) : actuellement simulés — brancher un service d'envoi
  (Formspree, Netlify Forms, backend…).
- **Photos** : remplacer les illustrations SVG de `assets/img/` par de vraies photos
  de l'atelier quand elles seront disponibles.

## 🛠️ Technologies

HTML5 · CSS3 (custom properties, `assets/css/mobile.css`) · JavaScript vanilla · aucune dépendance.
