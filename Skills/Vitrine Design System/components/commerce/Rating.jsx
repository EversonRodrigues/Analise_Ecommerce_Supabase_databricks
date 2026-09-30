import React from 'react';
const STAR = 'polygon(50% 0%, 61.8% 35.3%, 98.1% 35.3%, 68.7% 57.1%, 79.4% 91.2%, 50% 70%, 20.6% 91.2%, 31.3% 57.1%, 1.9% 35.3%, 38.2% 35.3%)';
export function Rating({ value = 0, count, size = 14, showValue = true, style }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) 13px/1 var(--font-sans)', color: 'var(--text-secondary)', ...style }}>
      {showValue && <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{value.toFixed(1).replace('.', ',')}</span>}
      <span aria-label={value + ' de 5 estrelas'} style={{ display: 'inline-flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i)) * 100;
          return <span key={i} style={{ width: size, height: size, clipPath: STAR, background: 'linear-gradient(90deg, var(--star) ' + fill + '%, var(--ink-200) ' + fill + '%)' }} />;
        })}
      </span>
      {count != null && <span>({count.toLocaleString('pt-BR')})</span>}
    </div>
  );
}
