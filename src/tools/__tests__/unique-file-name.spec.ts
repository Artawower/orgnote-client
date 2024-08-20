import { getUniqueFileName } from '../unique-file-name';

describe('unique-file-name', () => {
  it('should return unique name', () => {
    const fileName = getUniqueFileName(['Untitled-note.org']);

    expect(fileName).toMatchSnapshot();
  });

  it('Should return unique name with multiple default names', () => {
    const fileNames = [
      'Untitled-note.org',
      'Untitled-note-1.org',
      'Untitled-note-2.org',
    ];
    const fileName = getUniqueFileName(fileNames);
    expect(fileName).toMatchSnapshot();
  });
});
