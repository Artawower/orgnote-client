export function resolveValue<T>(value?: T | (() => T)): T | void {
  if (!value) {
    return;
  }
  return typeof value === 'function' ? (value as () => T)() : value;
}
