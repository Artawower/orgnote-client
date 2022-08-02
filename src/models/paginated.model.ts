export interface Paginated<T> {
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
  data: T[];
}
