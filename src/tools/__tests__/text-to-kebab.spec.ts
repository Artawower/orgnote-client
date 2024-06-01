// textToKebab.test.js
import { textToKebab } from '../text-to-kebab';

test('converts spaces to hyphens and converts to lowercase', () => {
  expect(textToKebab('Hello World')).toBe('hello-world');
  expect(textToKebab('This is a test')).toBe('this-is-a-test');
  expect(textToKebab('Another Example')).toBe('another-example');
});

test('handles empty string', () => {
  expect(textToKebab('')).toBe('');
});

test('handles multiple spaces', () => {
  expect(textToKebab('Multiple   Spaces')).toBe('multiple---spaces');
});

test('handles strings with no spaces', () => {
  expect(textToKebab('NoSpaces')).toBe('nospaces');
});

test('handles strings with special characters', () => {
  expect(textToKebab('Special! @Characters#')).toBe('special!-@characters#');
});
