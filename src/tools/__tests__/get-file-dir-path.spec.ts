import { getFileDirPath } from '../get-file-dir-path';

describe('get-file-dir-path', () => {
  it('Should return file path from array of strings', () => {
    expect(getFileDirPath(['dir', 'nested-dir', 'file.org'])).toBe(
      'dir/nested-dir'
    );
  });

  it('Should return file path from string', () => {
    expect(getFileDirPath('dir/nested-dir/file.org')).toBe('dir/nested-dir');
  });

  it('Should return empty string when file is in root', () => {
    expect(getFileDirPath('file.org')).toBe('');
    expect(getFileDirPath(['file.org'])).toBe('');
  });

  it('Should return empty string when file path is empty', () => {
    expect(getFileDirPath('')).toBe('');
    expect(getFileDirPath([])).toBe('');
  });

  it('It should return an empty string when a slash is passed as an argument.', () => {
    expect(getFileDirPath('/')).toBe('');
    expect(getFileDirPath(['/'])).toBe('');
  });

  it('It should return an empty string when multiple slashes is passed as an argument.', () => {
    expect(getFileDirPath('///dir/')).toBe('');
    expect(getFileDirPath(['/', '/', 'dir'])).toBe('');
  });
});
