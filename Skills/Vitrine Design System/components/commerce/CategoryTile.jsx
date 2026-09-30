import React, { useState } from 'react';
import { ImagePlaceholder } from '../core/ImagePlaceholder.jsx';
const BG = { lime: 'var(--lime-200)', ink: 'var(--ink-900)', mist: 'var(--ink-50)', paper: 'var(--paper-100)' };
export function CategoryTile({ label, image, tone = 'mist', onClick, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', minWidth: 0, ...style }}>
      <span style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 'var(--radius-xl)', background: BG[tone] || BG.mist, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hover ? 'scale(1.03)' : 'none', transition: 'transform var(--dur-base) var(--ease-out)' }}>
        {image ? <img src={image} alt="" style={{ width: '78%', height: '78%', objectFit: 'contain' }} /> :
          <ImagePlaceholder label={label} tone={tone === 'ink' ? 'ink' : 'paper'} radius="0" style={{ background: 'transparent', aspectRatio: 'auto', height: '100%' }} />}
      </span>
      <span style={{ font: 'var(--fw-semibold) 14px/1.3 var(--font-sans)', color: 'var(--text-primary)', textAlign: 'center' }}>{label}</span>
    </button>
  );
}
