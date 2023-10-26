export function getCssVar(varName: string): string {
  const root = document.body;
  const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(normalizedName);
}

export function getNumericCssVar(varName: string): number {
  const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
  const value = getCssVar(normalizedName);
  const n = value.replace(/\D/g, '');
  return +n;
}
