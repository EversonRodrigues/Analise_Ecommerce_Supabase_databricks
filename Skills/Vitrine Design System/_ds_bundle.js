/* @ds-bundle: {"format":4,"namespace":"VitrineDesignSystem_f1a071","components":[{"name":"CategoryTile","sourcePath":"components/commerce/CategoryTile.jsx"},{"name":"Price","sourcePath":"components/commerce/Price.jsx"},{"name":"ProductCard","sourcePath":"components/commerce/ProductCard.jsx"},{"name":"PromoBanner","sourcePath":"components/commerce/PromoBanner.jsx"},{"name":"Rating","sourcePath":"components/commerce/Rating.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"ImagePlaceholder","sourcePath":"components/core/ImagePlaceholder.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"QuantityStepper","sourcePath":"components/forms/QuantityStepper.jsx"},{"name":"SearchBar","sourcePath":"components/forms/SearchBar.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"}],"sourceHashes":{"components/commerce/CategoryTile.jsx":"a40d8b32c1b9","components/commerce/Price.jsx":"76de5fa2255f","components/commerce/ProductCard.jsx":"2fcbf5289a22","components/commerce/PromoBanner.jsx":"e8c39f1100d6","components/commerce/Rating.jsx":"c0aebee4fe24","components/core/Badge.jsx":"8e3f4274a3cd","components/core/Button.jsx":"5ce757e3e101","components/core/Icon.jsx":"aa4512a15cc4","components/core/IconButton.jsx":"1517f6221ed6","components/core/ImagePlaceholder.jsx":"8b00950f7ffe","components/forms/Checkbox.jsx":"541ca1966ea3","components/forms/Input.jsx":"db21b443bb5d","components/forms/QuantityStepper.jsx":"c6235590e738","components/forms/SearchBar.jsx":"65aa027cbf87","components/forms/Select.jsx":"016c7e73bda7","ui_kits/loja/CartScreen.jsx":"bfbf6579c36b","ui_kits/loja/Footer.jsx":"f9e6bf137046","ui_kits/loja/Header.jsx":"bcd3fd8d3ce4","ui_kits/loja/HomeScreen.jsx":"a916c30375ce","ui_kits/loja/ProductScreen.jsx":"e71512b998b0","ui_kits/loja/data.js":"b04db8198294"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.VitrineDesignSystem_f1a071 = window.VitrineDesignSystem_f1a071 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/commerce/Price.jsx
try { (() => {
const fmt = n => n.toFixed(2).split('.');
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function Price({
  value,
  original,
  installments,
  size = 'md',
  style
}) {
  const fs = {
    sm: 18,
    md: 24,
    lg: 36
  }[size] || 24;
  const [int, cents] = fmt(value);
  const intFmt = Number(int).toLocaleString('pt-BR');
  const off = original && original > value ? Math.round((1 - value / original) * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      ...style
    }
  }, original && original > value && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      font: 'var(--fw-regular) 13px/1.2 var(--font-sans)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      textDecoration: 'line-through'
    }
  }, brl(original)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-deal)',
      fontWeight: 700
    }
  }, "-", off, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      color: 'var(--text-price)',
      fontFamily: 'var(--font-sans)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: fs * 0.5,
      fontWeight: 600,
      marginTop: fs * 0.1,
      marginRight: 3
    }
  }, "R$"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: fs,
      fontWeight: 800,
      letterSpacing: '-0.02em'
    }
  }, intFmt), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: fs * 0.5,
      fontWeight: 700,
      marginTop: fs * 0.1
    }
  }, ",", cents)), installments && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-regular) 13px/1.3 var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, "ou ", installments, "x de ", brl(value / installments), " sem juros"));
}
Object.assign(__ds_scope, { Price });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Price.jsx", error: String((e && e.message) || e) }); }

// components/commerce/Rating.jsx
try { (() => {
const STAR = 'polygon(50% 0%, 61.8% 35.3%, 98.1% 35.3%, 68.7% 57.1%, 79.4% 91.2%, 50% 70%, 20.6% 91.2%, 31.3% 57.1%, 1.9% 35.3%, 38.2% 35.3%)';
function Rating({
  value = 0,
  count,
  size = 14,
  showValue = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--fw-medium) 13px/1 var(--font-sans)',
      color: 'var(--text-secondary)',
      ...style
    }
  }, showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 700
    }
  }, value.toFixed(1).replace('.', ',')), /*#__PURE__*/React.createElement("span", {
    "aria-label": value + ' de 5 estrelas',
    style: {
      display: 'inline-flex',
      gap: 2
    }
  }, [0, 1, 2, 3, 4].map(i => {
    const fill = Math.max(0, Math.min(1, value - i)) * 100;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        width: size,
        height: size,
        clipPath: STAR,
        background: 'linear-gradient(90deg, var(--star) ' + fill + '%, var(--ink-200) ' + fill + '%)'
      }
    });
  })), count != null && /*#__PURE__*/React.createElement("span", null, "(", count.toLocaleString('pt-BR'), ")"));
}
Object.assign(__ds_scope, { Rating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/Rating.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const TONES = {
  lime: ['var(--lime-500)', 'var(--ink-900)'],
  ink: ['var(--ink-900)', 'var(--white)'],
  neutral: ['var(--ink-50)', 'var(--ink-700)'],
  deal: ['var(--danger-500)', 'var(--white)'],
  success: ['var(--success-100)', 'var(--success-600)'],
  warning: ['var(--warning-100)', 'var(--warning-600)'],
  info: ['var(--info-100)', 'var(--info-600)']
};
function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  style
}) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: sm ? 20 : 24,
      padding: sm ? '0 8px' : '0 10px',
      borderRadius: 'var(--radius-pill)',
      background: bg,
      color: fg,
      font: 'var(--fw-bold) ' + (sm ? 11 : 12) + 'px/1 var(--font-sans)',
      letterSpacing: '.01em',
      whiteSpace: 'nowrap',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CDN = 'https://unpkg.com/lucide-static@0.460.0/icons/';
function Icon({
  name,
  size = 20,
  color = 'currentColor',
  style,
  label,
  ...rest
}) {
  const url = 'url(' + CDN + name + '.svg) center / contain no-repeat';
  return /*#__PURE__*/React.createElement("span", _extends({
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : true
  }, rest, {
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: 'none',
      backgroundColor: color,
      WebkitMask: url,
      mask: url,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const {
  useState
} = React;
const SIZES = {
  sm: {
    h: 36,
    px: 16,
    fs: 14,
    ic: 16
  },
  md: {
    h: 44,
    px: 22,
    fs: 15,
    ic: 18
  },
  lg: {
    h: 52,
    px: 28,
    fs: 16,
    ic: 20
  }
};
const VARIANTS = {
  primary: {
    bg: 'var(--accent)',
    hover: 'var(--accent-hover)',
    press: 'var(--accent-press)',
    fg: 'var(--text-on-accent)',
    bd: 'transparent'
  },
  secondary: {
    bg: 'var(--ink-900)',
    hover: 'var(--ink-800)',
    press: 'var(--ink-950)',
    fg: 'var(--white)',
    bd: 'transparent'
  },
  outline: {
    bg: 'transparent',
    hover: 'var(--ink-50)',
    press: 'var(--ink-100)',
    fg: 'var(--ink-900)',
    bd: 'var(--ink-900)'
  },
  ghost: {
    bg: 'transparent',
    hover: 'var(--ink-50)',
    press: 'var(--ink-100)',
    fg: 'var(--ink-900)',
    bd: 'transparent'
  },
  danger: {
    bg: 'var(--danger-500)',
    hover: 'var(--danger-600)',
    press: 'var(--danger-600)',
    fg: 'var(--white)',
    bd: 'transparent'
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  disabled,
  onClick,
  type = 'button',
  style
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const bg = disabled ? variant === 'ghost' || variant === 'outline' ? 'transparent' : 'var(--ink-100)' : press ? v.press : hover ? v.hover : v.bg;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: s.h,
      padding: '0 ' + s.px + 'px',
      width: fullWidth ? '100%' : undefined,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid ' + (disabled ? 'transparent' : v.bd),
      background: bg,
      color: disabled ? 'var(--text-disabled)' : v.fg,
      font: 'var(--fw-semibold) ' + s.fs + 'px/1 var(--font-sans)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transform: press && !disabled ? 'scale(.98)' : 'none',
      transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, iconLeft && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.ic
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.ic
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const {
  useState
} = React;
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 44,
  badge,
  onClick,
  style
}) {
  const [hover, setHover] = useState(false);
  const bgs = {
    ghost: hover ? 'var(--ink-50)' : 'transparent',
    soft: hover ? 'var(--ink-100)' : 'var(--ink-50)',
    inverse: hover ? 'rgba(255,255,255,.12)' : 'transparent',
    accent: hover ? 'var(--accent-hover)' : 'var(--accent)'
  };
  const fg = variant === 'inverse' ? 'var(--white)' : 'var(--ink-900)';
  return /*#__PURE__*/React.createElement("button", {
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      width: size,
      height: size,
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 0,
      borderRadius: 'var(--radius-pill)',
      background: bgs[variant] || bgs.ghost,
      color: fg,
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-out)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.5)
  }), badge != null && badge !== 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      borderRadius: 999,
      background: 'var(--accent)',
      color: 'var(--ink-900)',
      font: 'var(--fw-bold) 11px/18px var(--font-sans)',
      textAlign: 'center',
      boxShadow: '0 0 0 2px ' + (variant === 'inverse' ? 'var(--ink-900)' : 'var(--white)')
    }
  }, badge));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/ImagePlaceholder.jsx
try { (() => {
function ImagePlaceholder({
  label = 'imagem',
  ratio = '1 / 1',
  tone = 'paper',
  radius = 'var(--radius-md)',
  src,
  alt = '',
  style
}) {
  const tones = {
    paper: ['var(--paper-100)', 'var(--ink-400)'],
    ink: ['var(--ink-800)', 'var(--ink-300)'],
    lime: ['var(--lime-200)', 'var(--ink-600)']
  };
  const [bg, fg] = tones[tone] || tones.paper;
  if (src) return /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: '100%',
      aspectRatio: ratio,
      objectFit: 'contain',
      borderRadius: radius,
      background: 'var(--paper-100)',
      display: 'block',
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    role: "img",
    "aria-label": label,
    style: {
      width: '100%',
      aspectRatio: ratio,
      borderRadius: radius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, transparent 0 10px, rgba(15,27,51,.035) 10px 11px), ' + bg,
      color: fg,
      font: 'var(--fw-medium) 12px/1.3 var(--font-sans)',
      letterSpacing: '.02em',
      textAlign: 'center',
      padding: 12,
      ...style
    }
  }, label);
}
Object.assign(__ds_scope, { ImagePlaceholder });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ImagePlaceholder.jsx", error: String((e && e.message) || e) }); }

// components/commerce/CategoryTile.jsx
try { (() => {
const {
  useState
} = React;
const BG = {
  lime: 'var(--lime-200)',
  ink: 'var(--ink-900)',
  mist: 'var(--ink-50)',
  paper: 'var(--paper-100)'
};
function CategoryTile({
  label,
  image,
  tone = 'mist',
  onClick,
  style
}) {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      padding: 0,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '100%',
      aspectRatio: '1 / 1',
      borderRadius: 'var(--radius-xl)',
      background: BG[tone] || BG.mist,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: hover ? 'scale(1.03)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-out)'
    }
  }, image ? /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: '78%',
      height: '78%',
      objectFit: 'contain'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.ImagePlaceholder, {
    label: label,
    tone: tone === 'ink' ? 'ink' : 'paper',
    radius: "0",
    style: {
      background: 'transparent',
      aspectRatio: 'auto',
      height: '100%'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) 14px/1.3 var(--font-sans)',
      color: 'var(--text-primary)',
      textAlign: 'center'
    }
  }, label));
}
Object.assign(__ds_scope, { CategoryTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/CategoryTile.jsx", error: String((e && e.message) || e) }); }

// components/commerce/ProductCard.jsx
try { (() => {
const {
  useState
} = React;
function ProductCard({
  title,
  brand,
  image,
  imageLabel = 'foto do produto',
  price,
  original,
  rating,
  reviews,
  badge,
  badgeTone = 'deal',
  shipping,
  onClick,
  onAdd,
  style
}) {
  const [hover, setHover] = useState(false);
  const [fav, setFav] = useState(false);
  return /*#__PURE__*/React.createElement("article", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick: onClick,
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      padding: 14,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      boxShadow: hover ? 'var(--surface-card-shadow-hover)' : 'var(--surface-card-shadow)',
      transform: hover ? 'translateY(-2px)' : 'none',
      transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
      cursor: onClick ? 'pointer' : 'default',
      minWidth: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.ImagePlaceholder, {
    src: image,
    label: imageLabel,
    ratio: "1 / 1"
  }), badge && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: badgeTone,
    size: "sm",
    style: {
      position: 'absolute',
      top: 10,
      left: 10
    }
  }, badge), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "heart",
    label: "Favoritar",
    size: 36,
    variant: "soft",
    onClick: e => {
      e.stopPropagation();
      setFav(!fav);
    },
    style: {
      position: 'absolute',
      top: 8,
      right: 8,
      background: 'var(--white)',
      color: fav ? 'var(--danger-500)' : 'var(--ink-900)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 4px 4px',
      flex: 1
    }
  }, brand && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-overline)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, brand), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--fw-medium) 15px/1.35 var(--font-sans)',
      color: 'var(--text-primary)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: 40
    }
  }, title), rating != null && /*#__PURE__*/React.createElement(__ds_scope.Rating, {
    value: rating,
    count: reviews,
    size: 12
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 'auto',
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Price, {
    value: price,
    original: original,
    size: "md"
  }), onAdd && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "plus",
    label: "Adicionar ao carrinho",
    size: 40,
    variant: "accent",
    onClick: e => {
      e.stopPropagation();
      onAdd();
    }
  })), shipping && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--fw-medium) 13px/1.3 var(--font-sans)',
      color: 'var(--text-success)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "truck",
    size: 14
  }), shipping)));
}
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

// components/commerce/PromoBanner.jsx
try { (() => {
function PromoBanner({
  eyebrow,
  title,
  subtitle,
  cta = 'Ver ofertas',
  onCta,
  image,
  imageLabel = 'imagem da campanha',
  tone = 'ink',
  style
}) {
  const ink = tone === 'ink';
  return /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)',
      alignItems: 'center',
      gap: 32,
      padding: '48px 56px',
      borderRadius: 'var(--radius-xl)',
      background: ink ? 'var(--ink-900)' : 'var(--lime-500)',
      color: ink ? 'var(--white)' : 'var(--ink-900)',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      alignItems: 'flex-start'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-overline)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: ink ? 'var(--lime-500)' : 'var(--ink-700)'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--fw-black) 48px/1.04 var(--font-display)',
      letterSpacing: 'var(--ls-display)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) 18px/1.5 var(--font-sans)',
      color: ink ? 'var(--ink-300)' : 'var(--ink-700)',
      maxWidth: 420
    }
  }, subtitle), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: ink ? 'primary' : 'secondary',
    size: "lg",
    iconRight: "arrow-right",
    onClick: onCta,
    style: {
      marginTop: 8
    }
  }, cta)), /*#__PURE__*/React.createElement(__ds_scope.ImagePlaceholder, {
    src: image,
    label: imageLabel,
    ratio: "4 / 3",
    tone: ink ? 'ink' : 'lime',
    radius: "var(--radius-lg)"
  }));
}
Object.assign(__ds_scope, { PromoBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/commerce/PromoBanner.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange,
  disabled,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      font: 'var(--type-body)',
      fontSize: 15,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flex: 'none',
      borderRadius: 6,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: checked ? 'var(--ink-900)' : 'var(--white)',
      border: '1.5px solid ' + (checked ? 'var(--ink-900)' : 'var(--ink-300)'),
      transition: 'background var(--dur-fast)'
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14,
    color: "var(--lime-500)"
  })), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
const {
  useState
} = React;
function Input({
  label,
  hint,
  error,
  iconLeft,
  placeholder,
  value,
  defaultValue,
  onChange,
  type = 'text',
  disabled,
  style
}) {
  const [focus, setFocus] = useState(false);
  const bd = error ? 'var(--danger-500)' : focus ? 'var(--ink-900)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 'var(--control-md)',
      padding: '0 16px',
      borderRadius: 'var(--radius-md)',
      background: disabled ? 'var(--surface-muted)' : 'var(--white)',
      border: '1.5px solid ' + bd,
      boxShadow: focus ? '0 0 0 4px var(--lime-200)' : 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, iconLeft && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 18,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      font: 'var(--type-body)',
      color: 'var(--text-primary)'
    }
  })), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-small)',
      fontSize: 13,
      color: error ? 'var(--danger-600)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuantityStepper.jsx
try { (() => {
function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  style
}) {
  const h = size === 'sm' ? 36 : 44;
  const btn = dis => ({
    width: h,
    height: h - 3,
    border: 0,
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: dis ? 'not-allowed' : 'pointer',
    color: dis ? 'var(--ink-300)' : 'var(--ink-900)',
    borderRadius: 999
  });
  const set = n => onChange && onChange(Math.max(min, Math.min(max, n)));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: h,
      borderRadius: 'var(--radius-pill)',
      border: '1.5px solid var(--border-default)',
      background: 'var(--white)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Diminuir",
    style: btn(value <= min),
    onClick: () => set(value - 1)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: value <= min && min === 1 ? 'minus' : 'minus',
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "tabular",
    style: {
      minWidth: 28,
      textAlign: 'center',
      font: 'var(--fw-semibold) 15px/1 var(--font-sans)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Aumentar",
    style: btn(value >= max),
    onClick: () => set(value + 1)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "plus",
    size: 16
  })));
}
Object.assign(__ds_scope, { QuantityStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuantityStepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchBar.jsx
try { (() => {
const {
  useState
} = React;
function SearchBar({
  placeholder = 'O que você procura hoje?',
  value,
  onChange,
  onSubmit,
  inverse,
  style
}) {
  const [focus, setFocus] = useState(false);
  const [q, setQ] = useState(value || '');
  const submit = e => {
    e.preventDefault();
    onSubmit && onSubmit(q);
  };
  return /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 48,
      padding: '0 5px 0 20px',
      gap: 12,
      borderRadius: 'var(--radius-pill)',
      background: inverse ? 'var(--ink-800)' : 'var(--white)',
      border: '1.5px solid ' + (focus ? 'var(--accent)' : inverse ? 'transparent' : 'var(--border-default)'),
      transition: 'border-color var(--dur-fast)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 18,
    color: inverse ? 'var(--ink-300)' : 'var(--text-muted)'
  }), /*#__PURE__*/React.createElement("input", {
    value: q,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    onChange: e => {
      setQ(e.target.value);
      onChange && onChange(e.target.value);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      font: 'var(--type-body)',
      color: inverse ? 'var(--white)' : 'var(--text-primary)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    style: {
      height: 38,
      padding: '0 18px',
      border: 0,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--accent)',
      color: 'var(--ink-900)',
      font: 'var(--fw-semibold) 14px/1 var(--font-sans)',
      cursor: 'pointer'
    }
  }, "Buscar"));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  options = [],
  value,
  onChange,
  size = 'md',
  style
}) {
  const h = size === 'sm' ? 36 : 44;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      height: h,
      padding: '0 40px 0 16px',
      width: '100%',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid var(--border-default)',
      background: 'var(--white)',
      font: 'var(--fw-medium) 15px/1 var(--font-sans)',
      color: 'var(--text-primary)',
      cursor: 'pointer'
    }
  }, options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const l = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    color: "var(--text-muted)",
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/CartScreen.jsx
try { (() => {
const brl = n => 'R$ ' + n.toLocaleString('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function CartScreen({
  cart,
  setQty,
  remove,
  go
}) {
  const {
    ImagePlaceholder,
    QuantityStepper,
    Price,
    Button,
    Checkbox,
    Icon,
    Badge,
    IconButton
  } = window.VitrineDesignSystem_f1a071;
  const [gift, setGift] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const subtotal = cart.reduce((s, i) => s + i.p.price * i.qty, 0);
  const savings = cart.reduce((s, i) => s + ((i.p.original || i.p.price) - i.p.price) * i.qty, 0);
  const shipping = subtotal >= 99 || subtotal === 0 ? 0 : 19.9;
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const wrap = {
    maxWidth: 'var(--container-max)',
    margin: '0 auto',
    padding: '40px var(--gutter) 0'
  };
  if (done) return /*#__PURE__*/React.createElement("main", {
    style: {
      ...wrap,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      paddingTop: 96
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 999,
      background: 'var(--lime-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 36
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--ls-heading)'
    }
  }, "Pedido confirmado!"), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) 18px/1.5 var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, "Enviamos os detalhes para o seu e-mail. Chega amanh\xE3."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => {
      setDone(false);
      go('home');
    }
  }, "Continuar comprando"));
  if (!cart.length) return /*#__PURE__*/React.createElement("main", {
    style: {
      ...wrap,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      textAlign: 'center',
      paddingTop: 96
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 72,
      height: 72,
      borderRadius: 999,
      background: 'var(--ink-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shopping-bag",
    size: 32
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h2)'
    }
  }, "Seu carrinho est\xE1 vazio"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "Que tal come\xE7ar pelas ofertas do dia?"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => go('home')
  }, "Ver ofertas"));
  return /*#__PURE__*/React.createElement("main", {
    style: wrap
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--type-h1)',
      letterSpacing: 'var(--ls-heading)',
      marginBottom: 8
    }
  }, "Carrinho"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: 32
    }
  }, count, " ", count === 1 ? 'item' : 'itens'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr) 380px',
      gap: 32,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, subtotal < 99 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 18px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--lime-100)',
      font: '500 15px/1.3 var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "truck",
    size: 18
  }), "Faltam ", brl(99 - subtotal), " para o frete gr\xE1tis."), cart.map(({
    p,
    qty
  }) => /*#__PURE__*/React.createElement("article", {
    key: p.id,
    style: {
      display: 'grid',
      gridTemplateColumns: '120px minmax(0,1fr) auto',
      gap: 20,
      padding: 20,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-1)'
    }
  }, /*#__PURE__*/React.createElement(ImagePlaceholder, {
    label: "produto"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-overline)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, p.brand), /*#__PURE__*/React.createElement("a", {
    onClick: () => go('product', p),
    style: {
      font: '600 16px/1.35 var(--font-sans)',
      color: 'var(--text-primary)',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, p.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: '500 13px/1.3 var(--font-sans)',
      color: 'var(--text-success)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "truck",
    size: 14
  }), p.shipping), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(QuantityStepper, {
    value: qty,
    onChange: n => setQty(p.id, n),
    size: "sm"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconLeft: "trash-2",
    onClick: () => remove(p.id)
  }, "Remover"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement(Price, {
    value: p.price * qty,
    original: p.original ? p.original * qty : undefined,
    size: "md",
    style: {
      alignItems: 'flex-end'
    }
  }))))), /*#__PURE__*/React.createElement("aside", {
    style: {
      position: 'sticky',
      top: 148,
      padding: 24,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-2)',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-h3)'
    }
  }, "Resumo do pedido"), [['Subtotal', brl(subtotal)], ['Frete', shipping ? brl(shipping) : 'Grátis'], ['Descontos', savings ? '- ' + brl(savings) : '—']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      font: '400 15px/1 var(--font-sans)',
      color: k === 'Descontos' && savings ? 'var(--text-success)' : 'var(--text-secondary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("span", null, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 16px/1 var(--font-sans)'
    }
  }, "Total"), /*#__PURE__*/React.createElement(Price, {
    value: subtotal + shipping,
    installments: 10,
    size: "md",
    style: {
      alignItems: 'flex-end'
    }
  })), /*#__PURE__*/React.createElement(Checkbox, {
    label: "\xC9 para presente",
    checked: gift,
    onChange: setGift
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    fullWidth: true,
    iconRight: "arrow-right",
    onClick: () => setDone(true)
  }, "Finalizar compra"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    fullWidth: true,
    onClick: () => go('home')
  }, "Continuar comprando"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      font: '400 13px/1 var(--font-sans)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 14
  }), "Pagamento 100% seguro"))));
}
window.CartScreen = CartScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/CartScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/Footer.jsx
try { (() => {
function Footer() {
  const cols = [['Conheça a Vitrine', ['Sobre nós', 'Carreiras', 'Sustentabilidade']], ['Ajuda', ['Seus pedidos', 'Trocas e devoluções', 'Fale conosco']], ['Pagamento', ['Pix', 'Cartão em até 10x', 'Boleto']], ['Venda conosco', ['Seja um parceiro', 'Central do vendedor']]];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ink-950)',
      color: 'var(--ink-300)',
      marginTop: 'var(--space-20)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '64px var(--gutter) 40px',
      display: 'grid',
      gridTemplateColumns: '1.3fr repeat(4, 1fr)',
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '800 28px/1 var(--font-sans)',
      letterSpacing: '-.03em',
      color: 'var(--white)'
    }
  }, "vitrine", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--lime-500)'
    }
  }, ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      font: '400 14px/1.55 var(--font-sans)',
      maxWidth: 240
    }
  }, "Projeto de estudo de portf\xF3lio. Marca e produtos fict\xEDcios.")), cols.map(([h, ls]) => /*#__PURE__*/React.createElement("div", {
    key: h,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px/1 var(--font-sans)',
      color: 'var(--white)'
    }
  }, h), ls.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    style: {
      font: '400 14px/1.3 var(--font-sans)',
      color: 'var(--ink-300)',
      textDecoration: 'none'
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--border-inverse)',
      padding: '20px var(--gutter)',
      textAlign: 'center',
      font: '400 13px/1 var(--font-sans)'
    }
  }, "\xA9 2026 Vitrine \xB7 Estudo de design"));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/Header.jsx
try { (() => {
function Header({
  cartCount,
  go
}) {
  const {
    SearchBar,
    IconButton,
    Icon
  } = window.VitrineDesignSystem_f1a071;
  const nav = ['Ofertas do dia', 'Mais vendidos', 'Novidades', 'Áudio', 'Casa', 'Cozinha', 'Livros', 'Games'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--ink-900)',
      color: 'var(--white)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--gutter)',
      height: 'var(--header-h)',
      display: 'flex',
      alignItems: 'center',
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => go('home'),
    style: {
      font: '800 28px/1 var(--font-sans)',
      letterSpacing: '-.03em',
      color: 'var(--white)',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, "vitrine", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--lime-500)'
    }
  }, ".")), /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'transparent',
      border: 0,
      color: 'var(--white)',
      cursor: 'pointer',
      textAlign: 'left',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 18,
    color: "var(--lime-500)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 12px/1 var(--font-sans)',
      color: 'var(--ink-300)'
    }
  }, "Entregar em"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '600 14px/1 var(--font-sans)'
    }
  }, "S\xE3o Paulo 01310"))), /*#__PURE__*/React.createElement(SearchBar, {
    inverse: true,
    style: {
      flex: 1
    },
    onSubmit: () => go('home')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: "heart",
    label: "Favoritos",
    variant: "inverse"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "user",
    label: "Minha conta",
    variant: "inverse"
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "shopping-bag",
    label: "Carrinho",
    variant: "inverse",
    badge: cartCount,
    onClick: () => go('cart')
  }))), /*#__PURE__*/React.createElement("nav", {
    style: {
      borderTop: '1px solid var(--border-inverse)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--gutter)',
      height: 48,
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      font: '600 14px/1 var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 18
  }), "Categorias"), nav.map((n, i) => /*#__PURE__*/React.createElement("a", {
    key: n,
    onClick: () => go('home'),
    style: {
      font: '500 14px/1 var(--font-sans)',
      color: i === 0 ? 'var(--lime-500)' : 'var(--ink-200)',
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, n)))));
}
window.Header = Header;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/HomeScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SectionHead({
  title,
  action
}) {
  const {
    Icon
  } = window.VitrineDesignSystem_f1a071;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--ls-heading)'
    }
  }, title), action && /*#__PURE__*/React.createElement("a", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      font: '600 15px/1 var(--font-sans)',
      color: 'var(--text-primary)',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  }, action, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16
  })));
}
function HomeScreen({
  go,
  add
}) {
  const {
    PromoBanner,
    CategoryTile,
    ProductCard,
    Icon
  } = window.VitrineDesignSystem_f1a071;
  const {
    categories,
    products
  } = window.VITRINE_DATA;
  const perks = [['truck', 'Frete grátis', 'acima de R$ 99'], ['rotate-ccw', 'Troca fácil', 'em até 30 dias'], ['credit-card', 'Até 10x', 'sem juros'], ['shield-check', 'Compra segura', 'pagamento protegido']];
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '32px var(--gutter) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-section)'
    }
  }, /*#__PURE__*/React.createElement(PromoBanner, {
    eyebrow: "Semana Vitrine",
    title: "At\xE9 40% off em \xE1udio e som",
    subtitle: "Fones, caixas e acess\xF3rios selecionados, com frete gr\xE1tis para todo o Brasil.",
    onCta: () => go('product', products[0])
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
      marginTop: -32
    }
  }, perks.map(([ic, t, s]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '18px 20px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 999,
      background: 'var(--lime-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      font: '600 15px/1.2 var(--font-sans)'
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: '400 13px/1.2 var(--font-sans)',
      color: 'var(--text-muted)'
    }
  }, s))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Explore por categoria",
    action: "Ver todas"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 20
    }
  }, categories.map(c => /*#__PURE__*/React.createElement(CategoryTile, {
    key: c.id,
    label: c.label,
    tone: c.tone
  })))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Ofertas do dia",
    action: "Ver todas as ofertas"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
      gap: 24
    }
  }, products.slice(0, 4).map(p => /*#__PURE__*/React.createElement(ProductCard, _extends({
    key: p.id
  }, p, {
    onClick: () => go('product', p),
    onAdd: () => add(p)
  }))))), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Mais amados em Casa e Estilo",
    action: "Ver mais"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
      gap: 24
    }
  }, products.slice(4).map(p => /*#__PURE__*/React.createElement(ProductCard, _extends({
    key: p.id
  }, p, {
    onClick: () => go('product', p),
    onAdd: () => add(p)
  }))))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/ProductScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProductScreen({
  product,
  go,
  add
}) {
  const {
    ImagePlaceholder,
    Badge,
    Rating,
    Price,
    Button,
    QuantityStepper,
    Input,
    Icon,
    ProductCard,
    IconButton
  } = window.VitrineDesignSystem_f1a071;
  const [qty, setQty] = React.useState(1);
  const [thumb, setThumb] = React.useState(0);
  const [color, setColor] = React.useState('Grafite');
  const p = product;
  const related = window.VITRINE_DATA.products.filter(x => x.id !== p.id).slice(0, 4);
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '24px var(--gutter) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      font: '400 14px/1 var(--font-sans)',
      color: 'var(--text-muted)',
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: () => go('home'),
    style: {
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, "In\xEDcio"), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, p.cat), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)'
    }
  }, p.brand)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)',
      gap: 56,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '80px 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setThumb(i),
    style: {
      padding: 0,
      border: '2px solid ' + (thumb === i ? 'var(--ink-900)' : 'transparent'),
      borderRadius: 'var(--radius-md)',
      background: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(ImagePlaceholder, {
    label: 'vista ' + (i + 1),
    radius: "10px"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-xl)',
      padding: 24,
      boxShadow: 'var(--shadow-1)'
    }
  }, /*#__PURE__*/React.createElement(ImagePlaceholder, {
    label: 'foto do produto — vista ' + (thumb + 1),
    radius: "var(--radius-lg)"
  }), p.badge && /*#__PURE__*/React.createElement(Badge, {
    tone: p.badgeTone || 'deal',
    style: {
      position: 'absolute',
      top: 36,
      left: 36
    }
  }, p.badge))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-overline)',
      letterSpacing: 'var(--ls-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, p.brand), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--fw-bold) 34px/1.15 var(--font-sans)',
      letterSpacing: 'var(--ls-heading)',
      marginTop: -8
    }
  }, p.title), /*#__PURE__*/React.createElement(Rating, {
    value: p.rating,
    count: p.reviews,
    size: 16
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement(Price, {
    value: p.price,
    original: p.original,
    installments: 10,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)'
    }
  }, "Cor: ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400,
      color: 'var(--text-secondary)'
    }
  }, color)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, [['Grafite', 'var(--ink-800)'], ['Areia', '#D9CFBF'], ['Lima', 'var(--lime-500)']].map(([n, c]) => /*#__PURE__*/React.createElement("button", {
    key: n,
    "aria-label": n,
    onClick: () => setColor(n),
    style: {
      width: 40,
      height: 40,
      borderRadius: 999,
      background: c,
      border: 0,
      cursor: 'pointer',
      boxShadow: color === n ? '0 0 0 3px var(--white), 0 0 0 5px var(--ink-900)' : 'inset 0 0 0 1px rgba(15,27,51,.12)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-1)',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      color: 'var(--text-success)',
      font: '600 15px/1.3 var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "truck",
    size: 20
  }), p.shipping || 'Frete grátis'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      font: '500 14px/1 var(--font-sans)',
      color: 'var(--success-600)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: 'var(--success-500)'
    }
  }), "Em estoque"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(QuantityStepper, {
    value: qty,
    onChange: setQty,
    size: "md"
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    iconLeft: "shopping-bag",
    style: {
      flex: 1
    },
    onClick: () => {
      add(p, qty);
      go('cart');
    }
  }, "Adicionar ao carrinho"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "heart",
    label: "Favoritar",
    variant: "soft",
    size: 52
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    fullWidth: true,
    onClick: () => {
      add(p, qty);
      go('cart');
    }
  }, "Comprar agora")), /*#__PURE__*/React.createElement(Input, {
    label: "Calcular frete",
    placeholder: "Digite seu CEP",
    iconLeft: "map-pin"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      font: '400 15px/1.55 var(--font-sans)',
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--type-h3)',
      color: 'var(--text-primary)'
    }
  }, "Sobre este item"), /*#__PURE__*/React.createElement("p", null, "Cancelamento de ru\xEDdo ativo com tr\xEAs n\xEDveis, at\xE9 40 horas de bateria e carregamento r\xE1pido: 10 minutos garantem 5 horas de uso."), /*#__PURE__*/React.createElement("p", null, "Almofadas em espuma com mem\xF3ria e conex\xE3o simult\xE2nea com dois dispositivos.")))), /*#__PURE__*/React.createElement("section", {
    style: {
      marginTop: 'var(--gap-section)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--ls-heading)',
      marginBottom: 24
    }
  }, "Quem viu este item tamb\xE9m viu"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
      gap: 24
    }
  }, related.map(r => /*#__PURE__*/React.createElement(ProductCard, _extends({
    key: r.id
  }, r, {
    onClick: () => go('product', r),
    onAdd: () => add(r)
  }))))));
}
window.ProductScreen = ProductScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/ProductScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/loja/data.js
try { (() => {
window.VITRINE_DATA = {
  categories: [{
    id: 'audio',
    label: 'Áudio',
    tone: 'lime'
  }, {
    id: 'casa',
    label: 'Casa',
    tone: 'mist'
  }, {
    id: 'cozinha',
    label: 'Cozinha',
    tone: 'paper'
  }, {
    id: 'livros',
    label: 'Livros',
    tone: 'mist'
  }, {
    id: 'games',
    label: 'Games',
    tone: 'ink'
  }, {
    id: 'beleza',
    label: 'Beleza',
    tone: 'paper'
  }],
  products: [{
    id: 1,
    brand: 'Norte',
    title: 'Fone sem fio com cancelamento de ruído ativo',
    price: 349.9,
    original: 499.9,
    rating: 4.6,
    reviews: 1283,
    badge: '-30%',
    shipping: 'Frete grátis amanhã',
    cat: 'Áudio'
  }, {
    id: 2,
    brand: 'Casa Lume',
    title: 'Luminária de mesa articulada em alumínio escovado',
    price: 189,
    rating: 4.2,
    reviews: 87,
    badge: 'Novo',
    badgeTone: 'ink',
    shipping: 'Chega sexta, 3 out.',
    cat: 'Casa'
  }, {
    id: 3,
    brand: 'Grão',
    title: 'Cafeteira elétrica de filtro com jarra térmica 1,2 L',
    price: 229.9,
    original: 279.9,
    rating: 4.7,
    reviews: 3412,
    badge: '-18%',
    shipping: 'Frete grátis amanhã',
    cat: 'Cozinha'
  }, {
    id: 4,
    brand: 'Pulso',
    title: 'Caixa de som portátil à prova d\'água, 20 h de bateria',
    price: 279,
    original: 399,
    rating: 4.5,
    reviews: 902,
    badge: '-30%',
    shipping: 'Frete grátis amanhã',
    cat: 'Áudio'
  }, {
    id: 5,
    brand: 'Tecelã',
    title: 'Jogo de toalhas de algodão egípcio, 4 peças',
    price: 159.9,
    rating: 4.8,
    reviews: 516,
    shipping: 'Chega segunda, 6 out.',
    cat: 'Casa'
  }, {
    id: 6,
    brand: 'Folha',
    title: 'Kit de cuidados faciais com sérum e hidratante',
    price: 119.9,
    original: 149.9,
    rating: 4.4,
    reviews: 2210,
    badge: '-20%',
    shipping: 'Frete grátis amanhã',
    cat: 'Beleza'
  }, {
    id: 7,
    brand: 'Arco',
    title: 'Controle sem fio para console e PC, vibração dupla',
    price: 299.9,
    rating: 4.6,
    reviews: 4870,
    shipping: 'Frete grátis amanhã',
    cat: 'Games'
  }, {
    id: 8,
    brand: 'Página',
    title: 'Box de ficção científica — 3 volumes, capa dura',
    price: 139.9,
    original: 189.9,
    rating: 4.9,
    reviews: 640,
    badge: '-26%',
    shipping: 'Chega quinta, 2 out.',
    cat: 'Livros'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/loja/data.js", error: String((e && e.message) || e) }); }

__ds_ns.CategoryTile = __ds_scope.CategoryTile;

__ds_ns.Price = __ds_scope.Price;

__ds_ns.ProductCard = __ds_scope.ProductCard;

__ds_ns.PromoBanner = __ds_scope.PromoBanner;

__ds_ns.Rating = __ds_scope.Rating;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.ImagePlaceholder = __ds_scope.ImagePlaceholder;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.QuantityStepper = __ds_scope.QuantityStepper;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.Select = __ds_scope.Select;

})();
