export interface DateMarker {
  date: string;
  color?: string;
  type?: DateMarkerType;
  label?: string;
  data?: Record<string, unknown>;
}

export type DateMarkerType = 'dot' | 'bar' | 'highlight';

export type DatePickerMode = 'single' | 'range' | 'multiple';

export interface DateRange {
  from: string;
  to: string;
}

export type DateRangePickerResult =
  | ({ readonly action: 'apply' } & Readonly<DateRange>)
  | { readonly action: 'clear' };

export interface DateNavigation {
  year: number;
  month: number;
}

export interface DateClickPayload {
  date: string;
  markers: DateMarker[];
}

export type DatePickerModelValue = string | DateRange | string[] | undefined;
