/**
 * Vertical product tile used in grids and carousels.
 * @startingPoint section="Commerce" subtitle="Card de produto com preço, avaliação e frete" viewport="700x460"
 */
export interface ProductCardProps {
  title: string;
  brand?: string;
  /** Image URL; falls back to striped placeholder */
  image?: string;
  imageLabel?: string;
  price: number;
  original?: number;
  rating?: number;
  reviews?: number;
  /** e.g. "-32%", "Novo" */
  badge?: string;
  badgeTone?: 'lime' | 'ink' | 'neutral' | 'deal' | 'success' | 'warning' | 'info';
  /** e.g. "Frete grátis amanhã" */
  shipping?: string;
  onClick?: () => void;
  /** Shows lime + button when provided */
  onAdd?: () => void;
  style?: React.CSSProperties;
}
export declare function ProductCard(props: ProductCardProps): JSX.Element;
