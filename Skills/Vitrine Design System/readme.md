# Vitrine Design System

Vitrine is a **fictional e-commerce marketplace** created as a study/portfolio project. This design system has the foundations, components and a clickable storefront kit for building store screens in Brazilian Portuguese.

## Sources & context
- Brief: "design system para portfólio de projetos estudos".
- Reference uploads: `uploads/screencapture-amazon-br-…png` (full marketplace home page) and `uploads/Captura de tela…png` (retailer logo). They were used **only** as a general reference for marketplace information architecture: dense header with search, category rails, product grids, deal pricing and a footer. No logo, colors, type or distinctive UI from that retailer was copied. The brand name "Vitrine" and the whole visual identity are original.
- Choices from the intake form: ink navy + electric lime, humanist sans (Figtree), airy boutique density, Portuguese copy, screens Home / Produto / Carrinho.
- **No logo was supplied.** The brand appears as a plain Figtree 800 wordmark, `vitrine.`, with a lime period.

## Index
- `styles.css`: the entry point, made of `@import` lines only. It reaches `tokens/fonts.css, colors.css, typography.css, spacing.css, effects.css, base.css`.
- `components/core/`: Button, IconButton, Badge, Icon, ImagePlaceholder
- `components/forms/`: Input, SearchBar, Select, Checkbox, QuantityStepper
- `components/commerce/`: Price, Rating, ProductCard, CategoryTile, PromoBanner
- `guidelines/`: foundation specimen cards (colors, type, spacing, radii, elevation, layout, motion, iconography, wordmark, voice)
- `ui_kits/loja/`: clickable storefront (Home → Produto → Carrinho → Confirmação). See its README.
- `thumbnail.html`, `SKILL.md`

### Components
Button, IconButton, Badge, Icon, ImagePlaceholder, Input, SearchBar, Select, Checkbox, QuantityStepper, Price, Rating, ProductCard, CategoryTile, PromoBanner.

**Intentional additions:** there was no source component inventory, so this is an authored standard set sized for commerce. `Icon` wraps the Lucide CDN glyphs. `ImagePlaceholder` stands in for product photography until real images exist.

## Content fundamentals
- **Language:** Brazilian Portuguese. Address the shopper as **"você"** and never use "o usuário". The store speaks as "a Vitrine" or in the implied first person plural ("Enviamos os detalhes…").
- **Tone:** direct, warm and practical. Lead with the benefit and the fact (price, delivery date), then the detail. Sound like a helpful shop clerk, not a hype machine.
- **Casing:** sentence case everywhere: headings, buttons and nav ("Adicionar ao carrinho", "Ofertas do dia"). UPPERCASE is only for overline brand labels (12px, +0.08em tracking).
- **Buttons:** verb first, 1–3 words. Examples: "Adicionar ao carrinho", "Comprar agora", "Finalizar compra", "Ver ofertas".
- **Numbers:** BRL format `R$ 1.299,90`. Show discounts as `-30%`. Installments read "ou 10x de R$ 34,99 sem juros". Delivery dates are concrete: "Chega sexta, 3 out.", "Frete grátis amanhã".
- **Empty and error states** always suggest a next step: "Seu carrinho está vazio. Que tal começar pelas ofertas do dia?" and "Informe um e-mail válido".
- **No emoji. No exclamation stacks. No all-caps shouting.** The only exclamation mark is the celebratory "Pedido confirmado!".

## Visual foundations
- **Color:** Ink navy (`--ink-900 #0F1B33`) carries the text, the header, the footer and inverse surfaces. Electric lime (`--lime-500 #C6F432`) is the single accent: the primary CTA, cart badge, active nav, focus halo and highlights. Always put ink text on lime, never white. Deal red (`--danger-500`) is only for discount percentages and deal badges. Success green is for stock and shipping lines. Amber is for rating stars. Pages sit on a warm off-white (`--paper-50`) and cards are pure white.
- **Type:** Figtree only. Display and H1 use weight 800/700 with tight tracking (−0.025em / −0.015em). Body is 400 at 16/1.55. UI labels are 600. Prices are 800 with a half-size "R$" and raised cents, in tabular numerals.
- **Spacing:** 4px base scale. The layout is airy: sections are 64px apart, card padding is 14–24px and grid gaps are 24px. The container is at most 1280px with a 32px gutter. Product grids are 4-up.
- **Backgrounds:** flat color fields only. No gradients, no textures, no full-bleed photo backgrounds. Banners are large rounded ink or lime blocks with an image area inside.
- **Imagery:** product cut-outs on light neutral tiles (`--paper-100`), shot bright and neutral. Until real photos exist, use the striped `ImagePlaceholder`.
- **Corner radii:** soft. Inputs and images 14, cards 20, banners and category tiles 28, and buttons and badges are fully pill-shaped. Checkboxes 6.
- **Cards:** white background, no border, `--shadow-1` at rest. On hover they lift −2px and take `--shadow-2`. Shadows are cool, ink-tinted and low-opacity. Overlays (modals, drawers) use `--shadow-3` over the `--scrim`.
- **Borders:** 1.5px `--ink-200` on inputs and steppers. Ink 900 appears on focus and in outline buttons. 1px `--ink-100` dividers.
- **Hover:** lime buttons go lighter (`--lime-400`) and ink buttons go lighter (`--ink-800`). Ghost buttons get an `--ink-50` wash. Category tiles scale to 1.03.
- **Press:** buttons scale to 0.98 and take the darker accent (`--lime-600`).
- **Focus:** inputs get an ink border plus a 4px `--lime-200` halo. Swatches and buttons get a double ring (white, then ink).
- **Motion:** quick and functional. 120ms for color changes, 200ms for lifts, 360ms for panels, all with `--ease-out cubic-bezier(.2,.8,.2,1)`. No bounces and no infinite decoration.
- **Transparency and blur:** used sparingly. `--blur-glass` is only for sticky overlays over imagery. The header is solid ink.
- **Layout:** the header (76px, plus a 48px category nav) is sticky. The cart summary is sticky in a 380px column.

## Iconography
- **Lucide** (lucide-static@0.460.0 from the unpkg CDN), outline style with a 2px stroke. It's rendered by the `Icon` component as a CSS mask so it inherits `currentColor`.
- Sizes: 14–16 inline with text, 18–20 in buttons and inputs, 22–24 in the header.
- Core set: search, shopping-bag, heart, user, map-pin, truck, rotate-ccw, credit-card, shield-check, plus, minus, trash-2, chevron-right, chevron-down, menu, check, arrow-right.
- Rating stars are CSS clip-path shapes (in `Rating`) so they can fill partially. No emoji and no unicode glyphs as icons. No icon font. No bundled SVG or PNG assets.
