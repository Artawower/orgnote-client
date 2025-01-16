// NOTE It's not a real scheme, just a simple representation of actual scheme
// with necessary fields for rendering.

export interface ValibotMetadata {
  metadata: {
    conditionalKey?: string;
    textarea?: boolean;
    upload?: boolean;
  };
  type: string;
}

export interface ValibotScheme {
  type: string;
  options: ValibotScheme[];
  pipe?: ValibotMetadata[];
  entries: { [key: string]: ValibotScheme };
  literal?: string;
  wrapped?: {
    type: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function valibotScheme(t: any): ValibotScheme {
  return t as unknown as ValibotScheme;
}
