import React from 'react';
import { Button } from '../core/Button.jsx';
import { ImagePlaceholder } from '../core/ImagePlaceholder.jsx';
export function PromoBanner({ eyebrow, title, subtitle, cta = 'Ver ofertas', onCta, image, imageLabel = 'imagem da campanha', tone = 'ink', style }) {
  const ink = tone === 'ink';
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', alignItems: 'center', gap: 32, padding: '48px 56px', borderRadius: 'var(--radius-xl)',
      background: ink ? 'var(--ink-900)' : 'var(--lime-500)', color: ink ? 'var(--white)' : 'var(--ink-900)', overflow: 'hidden', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        {eyebrow && <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: ink ? 'var(--lime-500)' : 'var(--ink-700)' }}>{eyebrow}</span>}
        <h2 style={{ font: 'var(--fw-black) 48px/1.04 var(--font-display)', letterSpacing: 'var(--ls-display)' }}>{title}</h2>
        {subtitle && <p style={{ font: 'var(--fw-regular) 18px/1.5 var(--font-sans)', color: ink ? 'var(--ink-300)' : 'var(--ink-700)', maxWidth: 420 }}>{subtitle}</p>}
        <Button variant={ink ? 'primary' : 'secondary'} size="lg" iconRight="arrow-right" onClick={onCta} style={{ marginTop: 8 }}>{cta}</Button>
      </div>
      <ImagePlaceholder src={image} label={imageLabel} ratio="4 / 3" tone={ink ? 'ink' : 'lime'} radius="var(--radius-lg)" />
    </section>
  );
}
