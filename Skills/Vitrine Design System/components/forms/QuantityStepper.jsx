import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function QuantityStepper({ value = 1, min = 1, max = 99, onChange, size = 'md', style }) {
  const h = size === 'sm' ? 36 : 44;
  const btn = (dis) => ({ width: h, height: h - 3, border: 0, background: 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: dis ? 'not-allowed' : 'pointer', color: dis ? 'var(--ink-300)' : 'var(--ink-900)', borderRadius: 999 });
  const set = (n) => onChange && onChange(Math.max(min, Math.min(max, n)));
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: h, borderRadius: 'var(--radius-pill)', border: '1.5px solid var(--border-default)', background: 'var(--white)', ...style }}>
      <button aria-label="Diminuir" style={btn(value <= min)} onClick={() => set(value - 1)}><Icon name={value <= min && min === 1 ? 'minus' : 'minus'} size={16} /></button>
      <span className="tabular" style={{ minWidth: 28, textAlign: 'center', font: 'var(--fw-semibold) 15px/1 var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <button aria-label="Aumentar" style={btn(value >= max)} onClick={() => set(value + 1)}><Icon name="plus" size={16} /></button>
    </div>
  );
}
