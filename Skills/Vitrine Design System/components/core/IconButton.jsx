import React, { useState } from 'react';
import { Icon } from './Icon.jsx';
export function IconButton({ icon, label, variant = 'ghost', size = 44, badge, onClick, style }) {
  const [hover, setHover] = useState(false);
  const bgs = { ghost: hover ? 'var(--ink-50)' : 'transparent', soft: hover ? 'var(--ink-100)' : 'var(--ink-50)', inverse: hover ? 'rgba(255,255,255,.12)' : 'transparent', accent: hover ? 'var(--accent-hover)' : 'var(--accent)' };
  const fg = variant === 'inverse' ? 'var(--white)' : 'var(--ink-900)';
  return (
    <button aria-label={label} title={label} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', width: size, height: size, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: 0, borderRadius: 'var(--radius-pill)', background: bgs[variant] || bgs.ghost, color: fg, cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out)', ...style }}>
      <Icon name={icon} size={Math.round(size * 0.5)} />
      {badge != null && badge !== 0 && (
        <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999, background: 'var(--accent)',
          color: 'var(--ink-900)', font: 'var(--fw-bold) 11px/18px var(--font-sans)', textAlign: 'center', boxShadow: '0 0 0 2px ' + (variant === 'inverse' ? 'var(--ink-900)' : 'var(--white)') }}>{badge}</span>
      )}
    </button>
  );
}
