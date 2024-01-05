export function extractDynamicValue<T>(value?: T | (() => T)): T {
  if (!value) {
    return;
  }
  return typeof value === 'function' ? (value as () => T)() : value;
}
