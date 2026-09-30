export interface RatingProps {
  /** 0–5, fractional allowed */
  value?: number;
  /** Number of reviews */
  count?: number;
  /** Star size px */
  size?: number;
  showValue?: boolean;
  style?: React.CSSProperties;
}
export declare function Rating(props: RatingProps): JSX.Element;
