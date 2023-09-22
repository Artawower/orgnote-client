import { FileTree, FileNode } from 'src/repositories';
import {
  convertFlatTreeToFileTree,
  FlatTree,
  mergeFilesTrees,
  renameFileInTree,
} from '../file-tree-builder';

describe('file-tree-builder', () => {
  it('Should merge two file tree with preserving folders', () => {
    const srcTree: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {},
      },
    };

    const dstTree: FileTree = {
      f1: {
        filePath: [],
        name: 'f1',
        type: 'file',
      },
    };

    const mergedTree = mergeFilesTrees(srcTree, dstTree);

    // TODO: master inline snapshots are not supported yet https://bun.sh/guides/test/snapshot
    expect(mergedTree).toMatchSnapshot();
  });

  it('Should merge two file tree with preserving nested folders', () => {
    const srcTree: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {
          d2: {
            filePath: ['d1'],
            name: 'd2',
            type: 'folder',
            children: {},
          },
        },
      },
    };

    const dstTree: FileTree = {
      f1: {
        filePath: [],
        name: 'f1',
        type: 'file',
      },
    };

    const mergedTree = mergeFilesTrees(srcTree, dstTree);
    expect(mergedTree).toMatchSnapshot();
  });

  it('Should remove files from src directory if they are not in dst', () => {
    const srcTree: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {
          f1: {
            filePath: ['d1'],
            name: 'f1',
            type: 'file',
          },
          f2: {
            filePath: ['d1'],
            name: 'f2',
            type: 'file',
          },
        },
      },
    };

    const dstTree: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {},
      },
    };

    const mergedTree = mergeFilesTrees(srcTree, dstTree);
    expect(mergedTree).toMatchSnapshot();
  });

  it('Should rename nested file', () => {
    const t: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {
          f1: {
            filePath: ['d1'],
            name: 'f1',
            id: 'id',
            type: 'file',
          },
        },
      },
    };

    const fileNode: FileNode = {
      name: 'f1',
      id: 'id',
      filePath: ['d1'],
      type: 'file',
    };

    const newName = 'newName';

    const updatedTree = renameFileInTree(t, fileNode, newName);

    expect(updatedTree).toMatchSnapshot();
  });

  it('Should rename nested files path', () => {
    const t: FileTree = {
      d1: {
        filePath: [],
        name: 'd1',
        type: 'folder',
        children: {
          d2: {
            filePath: ['d1'],
            name: 'd2',
            type: 'folder',
            children: {
              f1: {
                filePath: ['d1', 'd2'],
                id: 'id',
                name: 'f1',
                type: 'file',
              },
            },
          },
        },
      },
    };

    const fileNode: FileNode = {
      name: 'd2',
      filePath: ['d1'],
      type: 'folder',
    };

    const newFolderName = 'newFolderName';
    const newTree = renameFileInTree(t, fileNode, newFolderName);
    expect(newTree).toMatchSnapshot();
  });

  it('Should convert flat tree to file tree', () => {
    const flatTree: FlatTree = {
      name: 'd1',
      type: 'folder',
      filePath: [],
      children: [
        {
          name: 'd2',
          type: 'folder',
          filePath: ['d1'],
          children: [
            {
              name: 'f1',
              type: 'file',
              id: 'fileId',
              filePath: ['d1', 'd2'],
            },
          ],
        },
        {
          name: 'f2',
          type: 'file',
          id: 'fileId',
          filePath: ['d1'],
        },
      ],
    };

    const fileTree = convertFlatTreeToFileTree(flatTree);
    expect(fileTree).toMatchSnapshot();
  });
});
