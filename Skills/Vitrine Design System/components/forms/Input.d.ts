export interface InputProps {
  label?: string;
  hint?: string;
  /** Error message; turns border red */
  error?: string;
  /** Lucide icon name */
  iconLeft?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
