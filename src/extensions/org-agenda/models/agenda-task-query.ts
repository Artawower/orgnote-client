import type { DateRange } from 'src/models/date-picker';

export type AgendaFilter = 'overdue' | 'today' | 'tomorrow' | 'next7days' | 'all';

export type AgendaDateFilter =
  | { readonly kind: 'preset'; readonly value: AgendaFilter }
  | ({ readonly kind: 'range' } & Readonly<DateRange>);

export interface AgendaTaskQuery {
  readonly dateFilter: AgendaDateFilter;
  readonly matchingTaskIds?: readonly string[];
}

