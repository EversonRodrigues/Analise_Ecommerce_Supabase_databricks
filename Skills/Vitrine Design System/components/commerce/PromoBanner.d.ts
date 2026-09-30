/**
 * Hero campaign banner: headline + CTA on ink or lime with image slot.
 * @startingPoint section="Commerce" subtitle="Banner de campanha com CTA" viewport="1200x420"
 */
export interface PromoBannerProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  onCta?: () => void;
  image?: string;
  imageLabel?: string;
  tone?: 'ink' | 'lime';
  style?: React.CSSProperties;
}
export declare function PromoBanner(props: PromoBannerProps): JSX.Element;
