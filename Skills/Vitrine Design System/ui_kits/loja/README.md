# UI kit — Loja Vitrine

Clickable desktop recreation (1440 wide) of the Vitrine storefront. Original design — not a copy of any real retailer.

- `index.html` — app shell + routing (home / product / cart), cart state, route persisted in localStorage.
- `Header.jsx` — ink header: wordmark, delivery location, SearchBar, favorites/account/cart IconButtons, category nav.
- `HomeScreen.jsx` — PromoBanner hero, perks strip, CategoryTile rail, two ProductCard grids.
- `ProductScreen.jsx` — gallery with thumbs, buy box (Price, color swatches, QuantityStepper, CTAs), shipping Input, related items.
- `CartScreen.jsx` — line items, free-shipping nudge, sticky order summary, confirmation + empty states.
- `Footer.jsx` — link columns on ink-950.
- `data.js` — fictional catalogue.

All product imagery uses `ImagePlaceholder`; drop real photos in via the `image` prop.
