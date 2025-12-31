import { test, expect } from 'vitest';
import { parse } from 'org-mode-ast';
import {
  getKeywordName,
  getKeywordValue,
  isSupportedKeyword,
  isKeywordEmpty,
  KEYWORD_PATTERNS,
} from './utils';

test('KEYWORD_PATTERNS contains all supported keyword patterns', () => {
  expect(KEYWORD_PATTERNS).toContain('#+title');
  expect(KEYWORD_PATTERNS).toContain('#+author');
  expect(KEYWORD_PATTERNS).toContain('#+date');
  expect(KEYWORD_PATTERNS).toContain('#+email');
  expect(KEYWORD_PATTERNS).toContain('#+description');
});

test('getKeywordName extracts keyword name from title keyword', () => {
  const ast = parse('#+TITLE: My Title');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBe('title');
});

test('getKeywordName extracts keyword name from author keyword', () => {
  const ast = parse('#+AUTHOR: John Doe');
  const keyword = ast.children?.first;
  expect(getKeywordName(keyword!)).toBe('author');
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

test('isSupportedKeyword returns true for supported keywords', () => {
  expect(isSupportedKeyword('title')).toBe(true);
  expect(isSupportedKeyword('author')).toBe(true);
  expect(isSupportedKeyword('date')).toBe(true);
  expect(isSupportedKeyword('email')).toBe(true);
  expect(isSupportedKeyword('description')).toBe(true);
});

test('isSupportedKeyword returns false for unsupported keywords', () => {
  expect(isSupportedKeyword('filetags')).toBe(false);
  expect(isSupportedKeyword('property')).toBe(false);
  expect(isSupportedKeyword('options')).toBe(false);
});

test('isSupportedKeyword returns false for null', () => {
  expect(isSupportedKeyword(null)).toBe(false);
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

test('isKeywordEmpty returns true for empty keyword value', () => {
  const ast = parse('#+TITLE:');
  const keyword = ast.children?.first;
  expect(isKeywordEmpty(keyword!)).toBe(true);
});

test('isKeywordEmpty returns true for whitespace-only keyword value', () => {
  const ast = parse('#+TITLE:   ');
  const keyword = ast.children?.first;
  expect(isKeywordEmpty(keyword!)).toBe(true);
});

test('isKeywordEmpty returns false for keyword with value', () => {
  const ast = parse('#+TITLE: Has Value');
  const keyword = ast.children?.first;
  expect(isKeywordEmpty(keyword!)).toBe(false);
});
