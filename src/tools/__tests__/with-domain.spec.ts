import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { withDomain } from '../with-domain';

describe('withDomain', () => {
  const originalProcessEnv = process.env;
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).location = { origin: 'http://localhost:3000' };
    process.env = { ...originalProcessEnv }; // Clone original env
  });

  afterEach(() => {
    process.env = originalProcessEnv; // Restore original env
    window.location = originalLocation;
  });

  it('should return path with window origin when CLIENT is true', () => {
    process.env.CLIENT = 'true';
    const path = '/test';
    const result = withDomain(path);
    expect(result).toBe('http://localhost:3000/test');
  });

  it('should return path with DOMAIN environment variable when CLIENT is false', () => {
    process.env.CLIENT = undefined;
    process.env.DOMAIN = 'http://example.com';
    const path = '/test';
    const result = withDomain(path);
    expect(result).toBe('http://example.com/test');
  });

  it('should return path only when CLIENT is false and DOMAIN is not set', () => {
    process.env.CLIENT = undefined;
    process.env.DOMAIN = undefined;
    const path = '/test';
    const result = withDomain(path);
    expect(result).toBe('/test');
  });

  it('should return path with empty string when CLIENT is false and DOMAIN is empty', () => {
    process.env.CLIENT = undefined;
    process.env.DOMAIN = '';
    const path = '/test';
    const result = withDomain(path);
    expect(result).toBe('/test');
  });

  it('should handle path without leading slash correctly', () => {
    process.env.CLIENT = 'true';
    const path = 'test';
    const result = withDomain(path);
    expect(result).toBe('http://localhost:3000/test');
  });
});
