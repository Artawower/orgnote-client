import { describe, expect, test } from 'vitest';
import { findOrgTagRanges } from './find-org-tag-ranges';

describe('findOrgTagRanges — inline-body', () => {
  test('matches single tag', () => {
    const ranges = findOrgTagRanges('Buy milk :work:', 'inline-body');
    expect(ranges).toEqual([{ from: 9, to: 15, tag: 'work' }]);
  });

  test('matches adjacent tags in a chain', () => {
    const ranges = findOrgTagRanges(':tag1:tag2:', 'inline-body');
    expect(ranges).toHaveLength(2);
    expect(ranges[0]?.tag).toBe('tag1');
    expect(ranges[1]?.tag).toBe('tag2');
  });

  test('matches three-tag chain', () => {
    const ranges = findOrgTagRanges(':tag:test:another:', 'inline-body');
    expect(ranges).toHaveLength(3);
    expect(ranges.map((r) => r.tag)).toEqual(['tag', 'test', 'another']);
  });

  test('matches underscore and digits', () => {
    const ranges = findOrgTagRanges(':work_2024:', 'inline-body');
    expect(ranges).toEqual([{ from: 0, to: 11, tag: 'work_2024' }]);
  });

  test('matches cyrillic tags', () => {
    const ranges = findOrgTagRanges(':работа:', 'inline-body');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]?.tag).toBe('работа');
  });

  test('does NOT match URL-like patterns (no space before)', () => {
    const ranges = findOrgTagRanges('https://example.com:8080:foo:', 'inline-body');
    expect(ranges).toHaveLength(0);
  });

  test('matches tag with surrounding spaces', () => {
    const ranges = findOrgTagRanges('text :work: more', 'inline-body');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]?.tag).toBe('work');
  });

  test('returns empty for plain text', () => {
    expect(findOrgTagRanges('no tags here', 'inline-body')).toHaveLength(0);
  });

  test('matches digits-only tag', () => {
    const ranges = findOrgTagRanges(':123:', 'inline-body');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]?.tag).toBe('123');
  });
});

describe('findOrgTagRanges — headline-title', () => {
  test('matches trailing tag on headline line', () => {
    const ranges = findOrgTagRanges('* TODO Buy milk :work:', 'headline-title');
    expect(ranges).toHaveLength(1);
    expect(ranges[0]?.tag).toBe('work');
  });

  test('matches trailing chain', () => {
    const ranges = findOrgTagRanges('* TODO Buy milk :work:groceries:', 'headline-title');
    expect(ranges).toHaveLength(2);
    expect(ranges.map((r) => r.tag)).toEqual(['work', 'groceries']);
  });

  test('does NOT match non-trailing tags in headline', () => {
    const ranges = findOrgTagRanges('* TODO :work: buy milk', 'headline-title');
    expect(ranges).toHaveLength(0);
  });

  test('handles multiline — each headline line independent', () => {
    const text = '* TODO Task :work:\n* DONE Other :home:';
    const ranges = findOrgTagRanges(text, 'headline-title');
    expect(ranges).toHaveLength(2);
    expect(ranges[0]?.tag).toBe('work');
    expect(ranges[1]?.tag).toBe('home');
  });

  test('returns empty for plain text without trailing tag', () => {
    expect(findOrgTagRanges('* TODO Buy milk', 'headline-title')).toHaveLength(0);
  });
});
