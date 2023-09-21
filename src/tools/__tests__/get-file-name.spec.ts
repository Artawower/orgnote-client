import { getFileName, getFileNameWithoutExtension } from '../get-file-name';

describe('get-file-name', () => {
  it('Should return file name from path', () => {
    expect(getFileName('/some/path/foo.org')).toBe('foo.org');
  });

  it('Should return file name from file name', () => {
    expect(getFileName('foo.org')).toBe('foo.org');
  });
});

describe('get-file-name-without-extension', () => {
  it('Should return file name without extension', () => {
    expect(getFileNameWithoutExtension('foo.org')).toBe('foo');
  });

  it('Should return file name without extension from path', () => {
    expect(getFileNameWithoutExtension('/some/path/foo.org')).toBe('foo');
  });
});
