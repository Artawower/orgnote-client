import { test, expect, vi } from 'vitest';
import { readExtension, readExtensionFromString, compileExtension } from '../read-extension';

const manifestExample = {
  name: 'Test Extension',
  version: '1.0.0',
  permissions: ['read', 'write'],
  category: 'other',
  sourceType: 'builtin',
};

const validExtensionScript = `
  export default {
    execute() {
      console.log('Executing extension');
    },
  };
  export const manifest = ${JSON.stringify(manifestExample)};
`;

const invalidExtensionScript = `
  export const manifest = {
    name: 'Test Extension',
    version: '1.0.0'
  };
`;

const mockModuleLoader = vi.fn(async (modulePath: string) => {
  if (modulePath.startsWith('data:text/javascript,')) {
    const content = decodeURIComponent(modulePath.replace('data:text/javascript,', ''));
    return eval(content);
  }
  throw new Error('Invalid module');
});

Object.defineProperty(global, 'import', {
  value: mockModuleLoader,
  writable: true,
});

test('loads extension from file', async () => {
  const file = new File([validExtensionScript], 'extension.js', { type: 'text/javascript' });
  const result = await readExtension(file);

  expect(result.manifest).toMatchObject({
    ...manifestExample,
    development: true,
  });
  expect(result.active).toBe(false);
  expect(result.module).toBe(encodeURIComponent(validExtensionScript));
});

test('loads extension from string', async () => {
  const result = await readExtensionFromString(validExtensionScript);

  expect(result.manifest).toMatchObject({
    ...manifestExample,
    development: true,
  });
  expect(result.active).toBe(false);
  expect(result.module).toBe(encodeURIComponent(validExtensionScript));
});

test('compiles and returns extension', async () => {
  const result = await compileExtension(validExtensionScript);

  expect(result).toBeDefined();
  expect(typeof result.execute).toBe('function');
});

test('throws error for invalid script in readExtensionFromString', async () => {
  await expect(readExtensionFromString(invalidExtensionScript)).rejects.toThrow();
});

test('throws error for invalid script in compileExtension', async () => {
  await expect(compileExtension(invalidExtensionScript)).rejects.toThrow();
});
