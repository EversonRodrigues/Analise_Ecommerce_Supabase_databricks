import React from 'react';
export function ImagePlaceholder({ label = 'imagem', ratio = '1 / 1', tone = 'paper', radius = 'var(--radius-md)', src, alt = '', style }) {
  const tones = { paper: ['var(--paper-100)', 'var(--ink-400)'], ink: ['var(--ink-800)', 'var(--ink-300)'], lime: ['var(--lime-200)', 'var(--ink-600)'] };
  const [bg, fg] = tones[tone] || tones.paper;
  if (src) return <img src={src} alt={alt} style={{ width: '100%', aspectRatio: ratio, objectFit: 'contain', borderRadius: radius, background: 'var(--paper-100)', display: 'block', ...style }} />;
  return (
    <div role="img" aria-label={label} style={{ width: '100%', aspectRatio: ratio, borderRadius: radius, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, transparent 0 10px, rgba(15,27,51,.035) 10px 11px), ' + bg, color: fg,
      font: 'var(--fw-medium) 12px/1.3 var(--font-sans)', letterSpacing: '.02em', textAlign: 'center', padding: 12, ...style }}>{label}</div>
  );
}
