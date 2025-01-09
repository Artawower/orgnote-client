export function extractDynamicValue<T>(value?: T | (() => T)): T {
  if (value === undefined) {
    return;
  }
  return typeof value === 'function' ? (value as () => T)() : value;
}
