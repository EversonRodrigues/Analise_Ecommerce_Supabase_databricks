import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
export function Input({ label, hint, error, iconLeft, placeholder, value, defaultValue, onChange, type = 'text', disabled, style }) {
  const [focus, setFocus] = useState(false);
  const bd = error ? 'var(--danger-500)' : focus ? 'var(--ink-900)' : 'var(--border-default)';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <span style={{ font: 'var(--type-label)', color: 'var(--text-primary)' }}>{label}</span>}
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, height: 'var(--control-md)', padding: '0 16px', borderRadius: 'var(--radius-md)',
        background: disabled ? 'var(--surface-muted)' : 'var(--white)', border: '1.5px solid ' + bd, boxShadow: focus ? '0 0 0 4px var(--lime-200)' : 'none',
        transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)' }}>
        {iconLeft && <Icon name={iconLeft} size={18} color="var(--text-muted)" />}
        <input type={type} placeholder={placeholder} value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'var(--type-body)', color: 'var(--text-primary)' }} />
      </span>
      {(error || hint) && <span style={{ font: 'var(--type-small)', fontSize: 13, color: error ? 'var(--danger-600)' : 'var(--text-muted)' }}>{error || hint}</span>}
    </label>
  );
}
