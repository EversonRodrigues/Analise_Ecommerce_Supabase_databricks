import React from 'react';
const CDN='https://unpkg.com/lucide-static@0.460.0/icons/';
export function Icon({ name, size = 20, color = 'currentColor', style, label, ...rest }) {
  const url = 'url(' + CDN + name + '.svg) center / contain no-repeat';
  return (
    <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...rest}
      style={{ display: 'inline-block', width: size, height: size, flex: 'none', backgroundColor: color, WebkitMask: url, mask: url, ...style }} />
  );
}
