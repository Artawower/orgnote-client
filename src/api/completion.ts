export interface CompletionCandidate<T = unknown> {
  icon?: string | (() => string);
  group?: string;
  title?: string | (() => string);
  description?: string;
  command: string;
  data: T;
  /* Command handler could be used instead of command string */
  commandHandler?: (data: T) => void;
}

export interface CompletionSearchResult<T = unknown> {
  total?: number;
  result: CompletionCandidate<T>[];
}

export type CandidateGetterFn<T = unknown> = (
  filter: string,
  limit?: number,
  offset?: number
) => CompletionSearchResult<T> | Promise<CompletionSearchResult<T>>;

export interface CompletionConfigs<T = unknown> {
  searchAutocompletions?: string[];
  itemsGetter: CandidateGetterFn<T>;
  placeholder?: string;
  itemHeight?: string;
  searchText?: string;
  onClicked?: (candidate: CompletionCandidate<T>) => void;
}
