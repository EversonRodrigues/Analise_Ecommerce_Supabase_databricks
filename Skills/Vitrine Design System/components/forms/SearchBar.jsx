import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
export function SearchBar({ placeholder = 'O que você procura hoje?', value, onChange, onSubmit, inverse, style }) {
  const [focus, setFocus] = useState(false);
  const [q, setQ] = useState(value || '');
  const submit = (e) => { e.preventDefault(); onSubmit && onSubmit(q); };
  return (
    <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 5px 0 20px', gap: 12, borderRadius: 'var(--radius-pill)',
      background: inverse ? 'var(--ink-800)' : 'var(--white)', border: '1.5px solid ' + (focus ? 'var(--accent)' : inverse ? 'transparent' : 'var(--border-default)'),
      transition: 'border-color var(--dur-fast)', ...style }}>
      <Icon name="search" size={18} color={inverse ? 'var(--ink-300)' : 'var(--text-muted)'} />
      <input value={q} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onChange={(e) => { setQ(e.target.value); onChange && onChange(e.target.value); }}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'var(--type-body)', color: inverse ? 'var(--white)' : 'var(--text-primary)' }} />
      <button type="submit" style={{ height: 38, padding: '0 18px', border: 0, borderRadius: 'var(--radius-pill)', background: 'var(--accent)', color: 'var(--ink-900)',
        font: 'var(--fw-semibold) 14px/1 var(--font-sans)', cursor: 'pointer' }}>Buscar</button>
    </form>
  );
}
