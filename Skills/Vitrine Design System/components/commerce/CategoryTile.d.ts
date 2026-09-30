export interface CategoryTileProps {
  label: string;
  /** Cut-out product image URL */
  image?: string;
  tone?: 'lime' | 'ink' | 'mist' | 'paper';
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function CategoryTile(props: CategoryTileProps): JSX.Element;
