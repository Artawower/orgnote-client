import { readOrgFile } from '../read-file';

describe('read-org-file', () => {
  it('Should read org file by provided entry without start slash', () => {
    const f: File = new File(['#+TITLE: some org file'], 'test.org', {
      type: 'text/org',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f as any).webkitRelativePath = 'dir/test.org';

    expect(readOrgFile(f)).resolves.toMatchSnapshot();
  });

  it('Should read org file by provided entry with start slash', () => {
    const f: File = new File(['#+TITLE: some org file'], 'test.org', {
      type: 'text/org',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f as any).webkitRelativePath = '/dir/nested/test.org';

    expect(readOrgFile(f)).resolves.toMatchSnapshot();
  });

  it('Should read org file by provided entry with single path', () => {
    const f: File = new File(['#+TITLE: some org file'], 'test.org', {
      type: 'text/org',
    });

    expect(readOrgFile(f)).resolves.toMatchSnapshot();
  });
});
