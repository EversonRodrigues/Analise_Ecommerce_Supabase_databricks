export interface IconProps {
  /** Lucide icon name (kebab-case), e.g. "search", "shopping-bag", "heart". */
  name: string;
  size?: number;
  color?: string;
  /** Accessible label; omit for decorative icons. */
  label?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
