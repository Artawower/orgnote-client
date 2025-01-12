import type {
  GetCssVar,
  GetCssTheme,
  GetNumericCssVar,
  GetCssProperty,
  GetCssNumericProperty,
  ApplyCSSVariables,
  ResetCSSVariables,
  ThemeVariable,
} from 'orgnote-api';
import { toKebabCase } from './to-kebab-case';

export const getCssVar: GetCssVar = (varName) => {
  const root = document.body;
  const normalizedName = normalizeCssVariable(varName);
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(normalizedName);
};

export const getCssTheme: GetCssTheme = (variableNames) => {
  return variableNames.reduce(
    (acc, cur) => {
      const variable = toKebabCase(cur);
      const cssValue = getCssVar(variable);
      acc[cur as ThemeVariable] = cssValue;
      return acc;
    },
    {} as { [key in ThemeVariable]?: string },
  );
};

export const getNumericCssVar: GetNumericCssVar = (varName) => {
  const normalizedName = normalizeCssVariable(varName);
  const value = getCssVar(normalizedName);
  const n = value.replace(/[^\d.]/g, '');
  return +n;
};

export const getCssProperty: GetCssProperty = (element, propertyName) => {
  const computedStyle = document.defaultView.getComputedStyle(element, null);
  return computedStyle.getPropertyValue(propertyName);
};

export const getCssNumericProperty: GetCssNumericProperty = (element, propertyName) => {
  const value = getCssProperty(element, propertyName);
  const n = value.replace(/[^\d.]/g, '');
  return +n;
};

export const applyCSSVariables: ApplyCSSVariables<string> = (variables) => {
  const body = document.querySelector('body') as HTMLElement;
  Object.keys(variables).forEach((k) => {
    body.style.setProperty(`--${toKebabCase(k)}`, `${variables[k as string]}`);
  });
};

export const resetCSSVariables: ResetCSSVariables<string> = (variables) => {
  const body = document.querySelector('body') as HTMLElement;
  Object.keys(variables).forEach((k) => {
    const kebabedVarName = toKebabCase(k);
    body.style.setProperty(`--${kebabedVarName}`, `var(--default-${kebabedVarName})`);
  });
};

export const normalizeCssVariable = (variable: string) => {
  return variable.startsWith('--') ? variable : `--${variable}`;
};
