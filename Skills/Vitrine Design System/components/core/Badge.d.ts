export interface BadgeProps {
  children?: React.ReactNode;
  tone?: 'lime' | 'ink' | 'neutral' | 'deal' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
