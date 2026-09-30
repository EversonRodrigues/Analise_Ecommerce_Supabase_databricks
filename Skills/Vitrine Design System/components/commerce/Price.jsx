import React from 'react';
const fmt = (n) => n.toFixed(2).split('.');
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function Price({ value, original, installments, size = 'md', style }) {
  const fs = { sm: 18, md: 24, lg: 36 }[size] || 24;
  const [int, cents] = fmt(value);
  const intFmt = Number(int).toLocaleString('pt-BR');
  const off = original && original > value ? Math.round((1 - value / original) * 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      {original && original > value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--fw-regular) 13px/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>
          <span style={{ textDecoration: 'line-through' }}>{brl(original)}</span>
          <span style={{ color: 'var(--text-deal)', fontWeight: 700 }}>-{off}%</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--text-price)', fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        <span style={{ fontSize: fs * 0.5, fontWeight: 600, marginTop: fs * 0.1, marginRight: 3 }}>R$</span>
        <span style={{ fontSize: fs, fontWeight: 800, letterSpacing: '-0.02em' }}>{intFmt}</span>
        <span style={{ fontSize: fs * 0.5, fontWeight: 700, marginTop: fs * 0.1 }}>,{cents}</span>
      </div>
      {installments && (
        <div style={{ font: 'var(--fw-regular) 13px/1.3 var(--font-sans)', color: 'var(--text-secondary)' }}>
          ou {installments}x de {brl(value / installments)} sem juros
        </div>
      )}
    </div>
  );
}
