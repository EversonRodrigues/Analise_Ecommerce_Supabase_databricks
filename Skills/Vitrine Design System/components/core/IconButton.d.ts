export interface IconButtonProps {
  /** Lucide icon name */
  icon: string;
  /** Required accessible label (also tooltip) */
  label: string;
  variant?: 'ghost' | 'soft' | 'inverse' | 'accent';
  /** Diameter in px (default 44) */
  size?: number;
  /** Count bubble, e.g. cart items */
  badge?: number | string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
