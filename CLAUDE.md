# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static multi-page web application for **Garage la Chapelle** (auto repair shop, Paris 18e). No build system, no framework, no package manager — open `index.html` directly in a browser. All pages are standalone HTML files sharing a common CSS design system and a single shared navigation script.

Visualise at 390px width (Chrome DevTools device mode) for the intended mobile-first experience.

## Architecture

### Two-layer CSS system

There are two CSS files with overlapping responsibilities — understand which pages use which:

- **`assets/css/mobile.css`** — the primary design system used by all current pages. Defines CSS custom properties (tokens), the dual-nav layout (mobile bottom nav + desktop top nav), and all reusable component classes (cards, forms, buttons, timeline, gallery, etc.).
- **`assets/css/global.css`** — an older/alternate design system with a different token set and a hamburger-drawer nav pattern. Only used by pages that explicitly link it (none currently do — it exists for reference or legacy use).

Never mix the two systems in the same page. All new pages should use `mobile.css`.

### Shared navigation via `assets/js/nav.js`

The nav script is injected into every page as the first element inside `<body>`:

```html
<script src="assets/js/nav.js" data-page="<page-id>"></script>
```

It programmatically creates and injects three elements: `.top-nav` (desktop), `.mobile-header` (mobile), `.bottom-nav` (mobile), and the WhatsApp FAB. The `data-page` attribute must match one of the five IDs defined in the `pages` array inside `nav.js` (`home`, `catalogue`, `rdv`, `blog`, `profile`) to highlight the active nav item.

Pages not in the bottom nav (contact, devis, galerie, a-propos, etc.) still include the script but pass a `data-page` value that won't match any ID — navigation still renders, just without an active highlight.

Cart count is persisted via `localStorage` (`cartCount` key) and displayed as a badge on both the desktop cart pill and mobile header button.

### Responsive layout strategy

`mobile.css` implements a two-breakpoint responsive system within a single stylesheet:

- **Default (mobile, < 900px)**: bottom nav visible, mobile header visible, top nav hidden, single-column layouts, `padding-bottom` accounts for the fixed bottom nav height.
- **≥ 900px**: top nav shown, mobile header and bottom nav hidden, multi-column grids (quick-actions → 4 col, services → 5 col, reviews → 3 col, cart → sidebar layout, etc.), `padding-bottom` removed.
- **≥ 1280px**: wider padding and larger gaps.

### Page-level inline styles

Complex pages (e.g. `rendez-vous.html`, `confirmation-commande.html`, `compte.html`) define page-specific styles in a `<style>` block in `<head>`, layered on top of `mobile.css`. This is the established pattern — do not create separate per-page CSS files.

## Design Tokens (`mobile.css`)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#1152d4` | Brand blue, buttons, active states |
| `--primary-light` | `#3b72e9` | Hover states, highlights, icon colour |
| `--primary-dark` | `#0c3ea0` | Deeper brand shade |
| `--accent-red` | `#e11d48` | Badges, errors, delete actions |
| `--accent-green` | `#10b981` | Success states |
| `--bg` | `#101622` | Page background |
| `--bg-card` | `#151d2e` | Card backgrounds |
| `--bg-card2` | `#1a2440` | Secondary card / image placeholder |
| `--text` | `#ffffff` | Primary text |
| `--text-2` | `rgba(255,255,255,.65)` | Secondary/muted text |
| `--text-3` | `rgba(255,255,255,.38)` | Disabled/placeholder text |
| `--border` | `rgba(255,255,255,.08)` | Subtle borders |
| `--border-p` | `rgba(17,82,212,.3)` | Primary-tinted borders (hover/active) |
| `--radius` | `12px` | Standard card radius |
| `--radius-lg` | `16px` | Larger card radius |
| `--radius-xl` | `22px` | Hero / large container radius |
| `--bot-nav-h` | `68px` | Mobile bottom nav height |
| `--top-nav-h` | `64px` | Desktop top nav height |

## Adding a New Page

1. Copy the `<head>` block from an existing page (keeps the correct viewport meta, Google Fonts, and `mobile.css` link).
2. Add `<script src="assets/js/nav.js" data-page="<id>"></script>` as the first child of `<body>`.
3. Wrap all content in `<main class="page-content">`.
4. If the page belongs in the bottom nav (rare — it already has 5 items), add it to the `pages` array in `nav.js`.
5. Otherwise add it to `extraLinks` in `nav.js` so it appears in the desktop top nav.
6. Link the new page from relevant existing pages.

## Key Component Classes

| Class | Description |
|---|---|
| `.btn-primary` / `.btn-secondary` | CTA buttons; add `.btn-full` for full-width |
| `.form-block` | Padded card wrapping form sections |
| `.form-input` / `.form-select` / `.form-textarea` | Styled inputs with focus ring |
| `.info-card` + `.info-row` | Labelled data display rows |
| `.product-card-h` | Horizontal product card (image + info + add-to-cart button) |
| `.cart-item` + `.qty-controls` | Cart row with +/− quantity controls |
| `.timeline` + `.timeline-item.done/.active` | Order/booking progress timeline |
| `.article-card` | Blog post card with image, tag, title, excerpt |
| `.gallery-grid` + `.gallery-item` | Instagram-style photo grid with lightbox |
| `.alert.success/.error/.info` | Inline status banners |
| `.chip` / `.chip.active` | Filter/category pills (horizontal scroll) |
| `.fab` / `.fab-whatsapp` | Fixed action button (WhatsApp is pre-wired in nav.js) |
| `.empty-state` | Centred empty-state block with icon |
| `.bottom-nav-item.active` | Active state for bottom nav (set via `data-page` on script tag) |
