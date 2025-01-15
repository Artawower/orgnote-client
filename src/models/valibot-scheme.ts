// NOTE It's not a real scheme, just a simple representation of actual scheme
// with necessary fields for rendering.

export interface ValibotMetadata {
  conditionalKey?: string;
  textarea?: boolean;
  upload?: boolean;
}

export interface ValibotScheme {
  type: string;
  options: ValibotScheme;
  pipe?: ValibotMetadata[];
  entries: { [key: string]: ValibotScheme };
  literal?: string;
}
