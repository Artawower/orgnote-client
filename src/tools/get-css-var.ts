export function getCssVar(varName: string): string {
  const root = document.body;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(`--${varName}`);
}

export function getNumericCssVar(varName: string): number {
  const value = getCssVar(varName);
  const n = value.replace(/\D/g, '');
  return +n;
}
