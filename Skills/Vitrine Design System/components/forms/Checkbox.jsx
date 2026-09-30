import React from 'react';
import { Icon } from '../core/Icon.jsx';
export function Checkbox({ label, checked, onChange, disabled, style }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1, font: 'var(--type-body)', fontSize: 15, ...style }}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange && onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
      <span style={{ width: 20, height: 20, flex: 'none', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'var(--ink-900)' : 'var(--white)', border: '1.5px solid ' + (checked ? 'var(--ink-900)' : 'var(--ink-300)'), transition: 'background var(--dur-fast)' }}>
        {checked && <Icon name="check" size={14} color="var(--lime-500)" />}
      </span>
      {label}
    </label>
  );
}
