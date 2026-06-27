import { expect, test, vi } from 'vitest';
import type { DiskFile } from 'orgnote-api';
import { walkDir } from './dir-items-getter';

const file = (path: string): DiskFile => ({ path, name: path.slice(path.lastIndexOf('/') + 1), type: 'file', size: 0, mtime: 0 });
const dir = (path: string): DiskFile => ({ path, name: path.slice(path.lastIndexOf('/') + 1), type: 'directory', size: 0, mtime: 0 });

test('walkDir keeps all directories and filters files by allowedExtensions', async () => {
  const readDir = vi.fn(async (path: string): Promise<DiskFile[]> => {
    if (path !== '/root') return [];
    return [
      dir('/root/sub'),
      file('/root/a.org.tmpl'),
      file('/root/b.txt'),
    ];
  });

  const result = await walkDir(readDir, '/root', true, ['.org.tmpl'], false);

  expect(result).toEqual([
    dir('/root/sub'),
    file('/root/a.org.tmpl'),
  ]);
  expect(readDir).toHaveBeenCalledWith('/root');
  expect(readDir).not.toHaveBeenCalledWith('/root/sub');
});

test('walkDir with recursive false returns only the immediate level', async () => {
  const readDir = vi.fn(async (path: string): Promise<DiskFile[]> => {
    if (path !== '/root') return [];
    return [dir('/root/sub'), file('/root/a.org')];
  });

  const result = await walkDir(readDir, '/root', true, [], false);

  expect(result).toEqual([dir('/root/sub'), file('/root/a.org')]);
  expect(readDir).toHaveBeenCalledTimes(1);
  expect(readDir).toHaveBeenCalledWith('/root');
});

test('walkDir excludes files when includeFiles is false but keeps directories', async () => {
  const readDir = vi.fn(async (): Promise<DiskFile[]> => [
    dir('/root/sub'),
    file('/root/a.org.tmpl'),
  ]);

  const result = await walkDir(readDir, '/root', false, ['.org.tmpl'], false);

  expect(result).toEqual([dir('/root/sub')]);
});

test('walkDir recurses into nested directories in level-then-nested order', async () => {
  const readDir = vi.fn(async (path: string): Promise<DiskFile[]> => {
    if (path === '/root') return [dir('/root/a'), file('/root/top.org')];
    if (path === '/root/a') return [file('/root/a/nested.org')];
    return [];
  });

  const result = await walkDir(readDir, '/root', true);

  expect(result).toEqual([
    dir('/root/a'),
    file('/root/top.org'),
    file('/root/a/nested.org'),
  ]);
});