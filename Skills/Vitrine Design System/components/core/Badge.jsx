import React from 'react';
const TONES = {
  lime: ['var(--lime-500)', 'var(--ink-900)'], ink: ['var(--ink-900)', 'var(--white)'], neutral: ['var(--ink-50)', 'var(--ink-700)'],
  deal: ['var(--danger-500)', 'var(--white)'], success: ['var(--success-100)', 'var(--success-600)'], warning: ['var(--warning-100)', 'var(--warning-600)'], info: ['var(--info-100)', 'var(--info-600)'],
};
export function Badge({ children, tone = 'neutral', size = 'md', style }) {
  const [bg, fg] = TONES[tone] || TONES.neutral;
  const sm = size === 'sm';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: sm ? 20 : 24, padding: sm ? '0 8px' : '0 10px', borderRadius: 'var(--radius-pill)',
      background: bg, color: fg, font: 'var(--fw-bold) ' + (sm ? 11 : 12) + 'px/1 var(--font-sans)', letterSpacing: '.01em', whiteSpace: 'nowrap', ...style }}>{children}</span>
  );
}
