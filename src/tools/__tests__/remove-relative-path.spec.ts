import { describe, it, expect } from 'bun:test';
import { removeRelativePath } from '../remove-relative-path';

describe('removeRelativePath', () => {
  it('removes relative "./" from the beginning of the path', () => {
    expect(removeRelativePath('./some/path')).toBe('some/path');
  });

  it('does nothing if the path does not start with "./"', () => {
    expect(removeRelativePath('some/path')).toBe('some/path');
  });

  it('handles empty strings', () => {
    expect(removeRelativePath('')).toBe('');
  });

  it('does nothing if the path is already an absolute path', () => {
    expect(removeRelativePath('/absolute/path')).toBe('/absolute/path');
  });

  it('removes "./" only from the beginning', () => {
    expect(removeRelativePath('some/./path')).toBe('some/./path');
  });
});
