export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (q: string) => void;
  onSubmit?: (q: string) => void;
  /** Use on ink surfaces (header) */
  inverse?: boolean;
  style?: React.CSSProperties;
}
export declare function SearchBar(props: SearchBarProps): JSX.Element;
