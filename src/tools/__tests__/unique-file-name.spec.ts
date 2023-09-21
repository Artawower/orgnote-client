import { FileTree } from 'src/repositories';
import { getUniqueFileName } from '../unique-file-name';

describe('unique-file-name', () => {
  it('should return unique name', () => {
    const fileNode: FileTree = {
      'Untitled-note.org': {
        name: 'Untitled-note.org',
        filePath: ['d1'],
        type: 'file',
      },
    };

    const fileName = getUniqueFileName(fileNode);

    expect(fileName).toMatchSnapshot();
  });

  it('Should return unique name with multiple default names', () => {
    const fileNode: FileTree = {
      'Untitled-note.org': {
        name: 'Untitled-note.org',
        filePath: ['d1'],
        type: 'file',
      },
      'Untitled-note-1.org': {
        name: 'Untitled-note-1.org',
        filePath: ['d1'],
        type: 'file',
      },
      'Untitled-note-2.org': {
        name: 'Untitled-note-2.org',
        filePath: ['d1'],
        type: 'file',
      },
    };
    const fileName = getUniqueFileName(fileNode);

    expect(fileName).toMatchSnapshot();
  });
});
