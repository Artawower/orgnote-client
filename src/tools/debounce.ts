export function debounce<T, T2, T3>(
  fn: (...args: any) => any,
  ms: number
): (...args: any) => any {
  let timer: NodeJS.Timeout;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}
