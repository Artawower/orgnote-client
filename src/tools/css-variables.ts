import { toKebabCase } from './case-converter';
import { ThemeVariable } from 'src/api';

export function getCssVar(varName: string): string {
  if (!process.env.CLIENT) {
    return '';
  }
  const root = document.body;
  const normalizedName = varName.startsWith('--') ? varName : `--${varName}`;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(normalizedName);
}

export function getCssTheme(variableNames: string[]): {
  [key in ThemeVariable]?: string;
} {
  return variableNames.reduce<{
    [key in ThemeVariable]?: string;
  }>((acc, cur) => {
    const variable = toKebabCase(cur);
    const cssValue = getCssVar(variable);
    acc[cur as ThemeVariable] = cssValue;
    return acc;
  }, {});
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

export function applyCSSVariables<T extends string>(variables: {
  [key in T]?: string | number;
}): void {
  const body = document.querySelector('body') as HTMLElement;
  Object.keys(variables).forEach((k) => {
    body.style.setProperty(`--${toKebabCase(k)}`, `${variables[k as T]}`);
  });
}

export function resetCSSVariables<T extends string>(variables: {
  [key in T]?: string | number;
}): void {
  const body = document.querySelector('body') as HTMLElement;
  Object.keys(variables).forEach((k) => {
    const kebabedVarName = toKebabCase(k);
    body.style.setProperty(
      `--${kebabedVarName}`,
      `var(--default-${kebabedVarName})`
    );
  });
}
