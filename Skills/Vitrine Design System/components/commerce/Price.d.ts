export interface PriceProps {
  /** Price in BRL */
  value: number;
  /** Previous price; shows strike-through and % off */
  original?: number;
  /** Interest-free installments count */
  installments?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}
export declare function Price(props: PriceProps): JSX.Element;
