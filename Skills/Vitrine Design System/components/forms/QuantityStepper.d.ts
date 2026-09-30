export interface QuantityStepperProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (n: number) => void;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function QuantityStepper(props: QuantityStepperProps): JSX.Element;
