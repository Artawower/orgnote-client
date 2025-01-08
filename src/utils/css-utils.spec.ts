import { test, expect } from 'vitest';
import {
  getCssVar,
  getCssTheme,
  getNumericCssVar,
  getCssProperty,
  getCssNumericProperty,
  applyCSSVariables,
  resetCSSVariables,
} from './css-utils';

test('returns CSS variable value when it exists', () => {
  document.body.style.setProperty('--test-var', '10px');
  const result = getCssVar('test-var');
  expect(result.trim()).toBe('10px');
});

test('returns empty string for non-existent CSS variable', () => {
  const result = getCssVar('non-existent-var');
  expect(result).toBe('');
});

test('returns theme variables as an object', () => {
  document.body.style.setProperty('--theme-color', '#ffffff');
  document.body.style.setProperty('--theme-font', 'Arial');
  const result = getCssTheme(['theme-color', 'theme-font']);
  expect(result).toEqual({ 'theme-color': '#ffffff', 'theme-font': 'Arial' });
});

test('returns empty object when theme variables do not exist', () => {
  const result = getCssTheme(['non-existent-var']);
  expect(result).toEqual({});
});

test('parses numeric CSS variable correctly', () => {
  document.body.style.setProperty('--test-var', '42px');
  const result = getNumericCssVar('test-var');
  expect(result).toBe(42);
});

test('returns NaN for non-numeric CSS variable value', () => {
  document.body.style.setProperty('--test-var', 'abc');
  const result = getNumericCssVar('test-var');
  expect(result).toBeNaN();
});

test('retrieves specific CSS property of an element', () => {
  const div = document.createElement('div');
  div.style.width = '100px';
  document.body.appendChild(div);
  const result = getCssProperty(div, 'width');
  expect(result).toBe('100px');
  document.body.removeChild(div);
});

test('returns empty string for non-existent CSS property', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const result = getCssProperty(div, 'non-existent-prop');
  expect(result).toBe('');
  document.body.removeChild(div);
});

test('retrieves numeric value of CSS property', () => {
  const div = document.createElement('div');
  div.style.width = '200px';
  document.body.appendChild(div);
  const result = getCssNumericProperty(div, 'width');
  expect(result).toBe(200);
  document.body.removeChild(div);
});

test('returns NaN for non-numeric CSS property value', () => {
  const div = document.createElement('div');
  div.style.width = 'auto';
  document.body.appendChild(div);
  const result = getCssNumericProperty(div, 'width');
  expect(result).toBeNaN();
  document.body.removeChild(div);
});

test('applies CSS variables to the body', () => {
  applyCSSVariables({ testVar: '50px', anotherVar: 'red' });
  expect(document.body.style.getPropertyValue('--test-var')).toBe('50px');
  expect(document.body.style.getPropertyValue('--another-var')).toBe('red');
});

test.only('resets CSS variables to default values', () => {
  document.body.style.setProperty('--default-test-var', '100px');
  document.body.style.setProperty('--default-another-var', 'blue');
  resetCSSVariables({ testVar: '', anotherVar: '' });
  expect(document.body.style.getPropertyValue('--test-var')).toBe('');
  expect(document.body.style.getPropertyValue('--another-var')).toBe('');
});
