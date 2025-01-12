import { test, expect, vi, beforeEach } from 'vitest';
import {
  getCssVar,
  getCssTheme,
  getNumericCssVar,
  getCssProperty,
  getCssNumericProperty,
  applyCSSVariables,
  resetCSSVariables,
  normalizeCssVariable,
  getCssVariableName,
} from './css-utils';

beforeEach(() => vi.clearAllMocks());

test('returns CSS variable value when it exists', () => {
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue('10px'),
  } as unknown as CSSStyleDeclaration);

  const result = getCssVar('test-var');
  expect(result.trim()).toBe('10px');
});

test('returns empty string for non-existent CSS variable', () => {
  const bodyStyleSpy = vi.spyOn(document.body.style, 'getPropertyValue').mockReturnValue('');
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  } as unknown as CSSStyleDeclaration);

  const result = getCssVar('non-existent-var');
  expect(result).toBe('');
  bodyStyleSpy.mockRestore();
});

test('returns theme variables as an object', () => {
  const bodyStyleSpy = vi.spyOn(document.body.style, 'getPropertyValue');

  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockImplementation((varName) => {
      if (varName === '--theme-color') return '#ffffff';
      if (varName === '--theme-font') return 'Arial';
      return '';
    }),
  } as unknown as CSSStyleDeclaration);

  const result = getCssTheme(['theme-color', 'theme-font']);
  expect(result).toEqual({ 'theme-color': '#ffffff', 'theme-font': 'Arial' });
  bodyStyleSpy.mockRestore();
});

test('returns empty object when theme variables do not exist', () => {
  const bodyStyleSpy = vi.spyOn(document.body.style, 'getPropertyValue').mockReturnValue('');
  const result = getCssTheme(['non-existent-var']);
  expect(result).toEqual({});
  bodyStyleSpy.mockRestore();
});

test('parses numeric CSS variable correctly', () => {
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue('42px'),
  } as unknown as CSSStyleDeclaration);

  const result = getNumericCssVar('test-var');
  expect(result).toBe(42);
});

test('retrieves specific CSS property of an element', () => {
  const div = document.createElement('div');
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue('100px'),
  } as unknown as CSSStyleDeclaration);
  const result = getCssProperty(div, 'width');
  expect(result).toBe('100px');
});

test('returns empty string for non-existent CSS property', () => {
  const div = document.createElement('div');
  const computedStyleSpy = vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue(''),
  } as unknown as CSSStyleDeclaration);

  const result = getCssProperty(div, 'non-existent-prop');
  expect(computedStyleSpy).toHaveBeenCalledWith(div, null);
  expect(result).toBe('');
  computedStyleSpy.mockRestore();
});

test('retrieves numeric value of CSS property', () => {
  const div = document.createElement('div');
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue('200px'),
  } as unknown as CSSStyleDeclaration);
  const result = getCssNumericProperty(div, 'width');
  expect(result).toBe(200);
});

test('returns 0 for non-numeric CSS property value', () => {
  const div = document.createElement('div');
  vi.spyOn(document.defaultView, 'getComputedStyle').mockReturnValue({
    getPropertyValue: vi.fn().mockReturnValue('px solid red'),
  } as unknown as CSSStyleDeclaration);
  const result = getCssNumericProperty(div, 'border');
  expect(result).toBe(0);
});

test('applies CSS variables to the body', () => {
  const bodyStyleSpy = vi.spyOn(document.body.style, 'setProperty');
  applyCSSVariables({ testVar: '50px', anotherVar: 'red' });
  expect(bodyStyleSpy).toHaveBeenCalledWith('--test-var', '50px');
  expect(bodyStyleSpy).toHaveBeenCalledWith('--another-var', 'red');
  bodyStyleSpy.mockRestore();
});

test('resets CSS variables to default values', () => {
  const bodyStyleSpy = vi.spyOn(document.body.style, 'setProperty');
  resetCSSVariables({ testVar: '', anotherVar: '' });
  expect(bodyStyleSpy).toHaveBeenCalledWith('--test-var', 'var(--default-test-var)');
  expect(bodyStyleSpy).toHaveBeenCalledWith('--another-var', 'var(--default-another-var)');
  bodyStyleSpy.mockRestore();
});

test('returns the variable as is if it starts with "--"', () => {
  const input = '--primary-color';
  const output = normalizeCssVariable(input);
  expect(output).toBe('--primary-color');
});

test('adds "--" prefix if variable does not start with it', () => {
  const input = 'primary-color';
  const output = normalizeCssVariable(input);
  expect(output).toBe('--primary-color');
});

test('handles empty string', () => {
  const input = '';
  const output = normalizeCssVariable(input);
  expect(output).toBe('--');
});

test('handles variable with special characters', () => {
  const input = 'color@variable';
  const output = normalizeCssVariable(input);
  expect(output).toBe('--color@variable');
});

test('handles variable already prefixed with "--"', () => {
  const input = '--color-variable';
  const output = normalizeCssVariable(input);
  expect(output).toBe('--color-variable');
});

test('returns a valid CSS variable name with "var(--...)" syntax for normalized variable', () => {
  const input = 'variable';
  const output = getCssVariableName(input);
  expect(output).toBe('var(--variable)');
});

test('handles variables already prefixed with "--"', () => {
  const input = '--already-prefixed';
  const output = getCssVariableName(input);
  expect(output).toBe('var(--already-prefixed)');
});

test('handles empty string input', () => {
  const input = '';
  const output = getCssVariableName(input);
  expect(output).toBe('');
});

test('handles variable with special characters', () => {
  const input = 'special@variable';
  const output = getCssVariableName(input);
  expect(output).toBe('var(--special@variable)');
});
