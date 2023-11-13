export function getCssVar(varName: string): string {
  const root = document.body;
  const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(normalizedName);
}

export function getNumericCssVar(varName: string): number {
  const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
  const value = getCssVar(normalizedName);
  const n = value.replace(/[^\d\.]/g, '');
  return +n;
}

export function getCssProperty(element: Element, propertyName: string): string {
  const computedStyle = document.defaultView.getComputedStyle(element, null);
  return computedStyle.getPropertyValue(propertyName);
}

export function getCssNumericProperty(
  element: Element,
  propertyName: string
): number {
  const value = getCssProperty(element, propertyName);
  const n = value.replace(/[^\d\.]/g, '');
  return +n;
}
