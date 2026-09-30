export interface ImagePlaceholderProps {
  /** Describes the image that should go here */
  label?: string;
  /** CSS aspect-ratio, default "1 / 1" */
  ratio?: string;
  tone?: 'paper' | 'ink' | 'lime';
  radius?: string;
  /** When provided renders a real <img> instead of the placeholder */
  src?: string;
  alt?: string;
  style?: React.CSSProperties;
}
export declare function ImagePlaceholder(props: ImagePlaceholderProps): JSX.Element;
