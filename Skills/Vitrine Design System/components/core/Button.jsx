import React, { useState } from 'react';
import { Icon } from './Icon.jsx';
const SIZES = { sm: { h: 36, px: 16, fs: 14, ic: 16 }, md: { h: 44, px: 22, fs: 15, ic: 18 }, lg: { h: 52, px: 28, fs: 16, ic: 20 } };
const VARIANTS = {
  primary: { bg: 'var(--accent)', hover: 'var(--accent-hover)', press: 'var(--accent-press)', fg: 'var(--text-on-accent)', bd: 'transparent' },
  secondary: { bg: 'var(--ink-900)', hover: 'var(--ink-800)', press: 'var(--ink-950)', fg: 'var(--white)', bd: 'transparent' },
  outline: { bg: 'transparent', hover: 'var(--ink-50)', press: 'var(--ink-100)', fg: 'var(--ink-900)', bd: 'var(--ink-900)' },
  ghost: { bg: 'transparent', hover: 'var(--ink-50)', press: 'var(--ink-100)', fg: 'var(--ink-900)', bd: 'transparent' },
  danger: { bg: 'var(--danger-500)', hover: 'var(--danger-600)', press: 'var(--danger-600)', fg: 'var(--white)', bd: 'transparent' },
};
export function Button({ children, variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth, disabled, onClick, type = 'button', style }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const s = SIZES[size] || SIZES.md; const v = VARIANTS[variant] || VARIANTS.primary;
  const bg = disabled ? (variant === 'ghost' || variant === 'outline' ? 'transparent' : 'var(--ink-100)') : press ? v.press : hover ? v.hover : v.bg;
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: s.h, padding: '0 ' + s.px + 'px',
        width: fullWidth ? '100%' : undefined, borderRadius: 'var(--radius-pill)', border: '1.5px solid ' + (disabled ? 'transparent' : v.bd),
        background: bg, color: disabled ? 'var(--text-disabled)' : v.fg, font: 'var(--fw-semibold) ' + s.fs + 'px/1 var(--font-sans)',
        cursor: disabled ? 'not-allowed' : 'pointer', transform: press && !disabled ? 'scale(.98)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)', whiteSpace: 'nowrap', ...style }}>
      {iconLeft && <Icon name={iconLeft} size={s.ic} />}
      {children}
      {iconRight && <Icon name={iconRight} size={s.ic} />}
    </button>
  );
}
