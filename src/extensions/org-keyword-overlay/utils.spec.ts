import { test, expect } from 'vitest';
import { parse } from 'org-mode-ast';
import { getKeywordName, getKeywordValue } from './utils';

test('getKeywordName extracts keyword name from title keyword', () => {
  const ast = parse('#+TITLE: My Title');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBe('title');
});

test('getKeywordName extracts keyword name from description keyword', () => {
  const ast = parse('#+DESCRIPTION: Some note summary');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBe('description');
});

test('getKeywordName returns lowercase keyword name', () => {
  const ast = parse('#+TITLE: Test');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBe('title');
});

test('getKeywordName returns null for non-keyword node', () => {
  const ast = parse('Just some text');
  const node = ast.children?.first;
  expect(getKeywordName(node!)).toBeNull();
});

test('getKeywordName returns null for keyword without colon', () => {
  const ast = parse('#+INVALID');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBeNull();
});

test('getKeywordValue extracts value from keyword with space after colon', () => {
  const ast = parse('#+TITLE: My Title');
  const keyword = ast.children?.first;
  expect(getKeywordValue(keyword!)).toBe('My Title');
});

test('getKeywordValue extracts value from keyword without space after colon', () => {
  const ast = parse('#+TITLE:NoSpace');
  const keyword = ast.children?.first;
  expect(getKeywordValue(keyword!)).toBe('NoSpace');
});

test('getKeywordValue returns empty string for keyword with empty value', () => {
  const ast = parse('#+TITLE:');
  const keyword = ast.children?.first;
  expect(getKeywordValue(keyword!)).toBe('');
});

test('getKeywordValue returns empty string for keyword with only whitespace', () => {
  const ast = parse('#+TITLE:   ');
  const keyword = ast.children?.first;
  expect(getKeywordValue(keyword!)).toBe('');
});

test('getKeywordValue trims whitespace from value', () => {
  const ast = parse('#+TITLE:   Padded Value   ');
  const keyword = ast.children?.first;
  expect(getKeywordValue(keyword!)).toBe('Padded Value');
});