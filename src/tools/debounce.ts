export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor = 100
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
