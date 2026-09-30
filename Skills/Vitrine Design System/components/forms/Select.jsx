import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Select({ label, options = [], value, onChange, size = 'md', style }) {
  const h = size === 'sm' ? 36 : 44;
  return (
    <label style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <span style={{ font: 'var(--type-label)' }}>{label}</span>}
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <select value={value} onChange={(e) => onChange && onChange(e.target.value)}
          style={{ appearance: 'none', WebkitAppearance: 'none', height: h, padding: '0 40px 0 16px', width: '100%', borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-default)', background: 'var(--white)', font: 'var(--fw-medium) 15px/1 var(--font-sans)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {options.map((o) => { const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
        </select>
        <Icon name="chevron-down" size={16} color="var(--text-muted)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </span>
    </label>
  );
}
