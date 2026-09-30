import React, { useState } from 'react';
import { ImagePlaceholder } from '../core/ImagePlaceholder.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { Badge } from '../core/Badge.jsx';
import { Price } from './Price.jsx';
import { Rating } from './Rating.jsx';
import { Icon } from '../core/Icon.jsx';
export function ProductCard({ title, brand, image, imageLabel = 'foto do produto', price, original, rating, reviews, badge, badgeTone = 'deal', shipping, onClick, onAdd, style }) {
  const [hover, setHover] = useState(false);
  const [fav, setFav] = useState(false);
  return (
    <article onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)',
        boxShadow: hover ? 'var(--surface-card-shadow-hover)' : 'var(--surface-card-shadow)', transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)', cursor: onClick ? 'pointer' : 'default', minWidth: 0, ...style }}>
      <div style={{ position: 'relative' }}>
        <ImagePlaceholder src={image} label={imageLabel} ratio="1 / 1" />
        {badge && <Badge tone={badgeTone} size="sm" style={{ position: 'absolute', top: 10, left: 10 }}>{badge}</Badge>}
        <IconButton icon="heart" label="Favoritar" size={36} variant="soft" onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
          style={{ position: 'absolute', top: 8, right: 8, background: 'var(--white)', color: fav ? 'var(--danger-500)' : 'var(--ink-900)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px 4px', flex: 1 }}>
        {brand && <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{brand}</span>}
        <h3 style={{ font: 'var(--fw-medium) 15px/1.35 var(--font-sans)', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>{title}</h3>
        {rating != null && <Rating value={rating} count={reviews} size={12} />}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 'auto', paddingTop: 4 }}>
          <Price value={price} original={original} size="md" />
          {onAdd && <IconButton icon="plus" label="Adicionar ao carrinho" size={40} variant="accent" onClick={(e) => { e.stopPropagation(); onAdd(); }} />}
        </div>
        {shipping && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--fw-medium) 13px/1.3 var(--font-sans)', color: 'var(--text-success)' }}><Icon name="truck" size={14} />{shipping}</span>}
      </div>
    </article>
  );
}
