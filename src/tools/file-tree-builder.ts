import {
  FileNode,
  FileNodeInfo,
  FilePathInfo,
  FileTree,
} from 'src/repositories';
import { v4 } from 'uuid';

export interface FlatTree extends FileNodeInfo {
  children?: FlatTree[];
}

// TODO: master convert to class or hook
// TODO: master write tests
const createHashNode = (
  parentPath: string[],
  path: string,
  id?: string
): FileNode => {
  const isFileName = path.includes('.');
  return {
    name: path,
    filePath: [...parentPath],
    id: id ?? v4(),
    type: isFileName ? 'file' : 'folder',
    children: {},
  };
};

const sortFileNodes = (a: FlatTree, b: FlatTree): number => {
  if (a.type === 'folder' && b.type === 'file') {
    return -1;
  }
  if (a.type === 'file' && b.type === 'folder') {
    return 1;
  }
  return a.name.localeCompare(b.name);
};

export const convertFileTreeToFlatTree = (fileTree?: FileTree): FlatTree[] => {
  if (!fileTree) {
    return [];
  }
  const tree: FlatTree[] = [];
  Object.entries(fileTree).forEach(([_, value]) => {
    const node = {
      ...value,
      children: convertFileTreeToFlatTree(value.children),
    };
    tree.push(node);
  });
  const sortedTree = tree.sort(sortFileNodes);
  return sortedTree;
};

export const buildFileTree = (info: FilePathInfo[]): FileTree => {
  const result = info.reduce<FileTree>((acc: FileTree, cur: FilePathInfo) => {
    let nodeHead = acc;
    const parentPath: string[] = [];
    cur.filePath.forEach((path) => {
      if (!nodeHead[path]) {
        const newNode = createHashNode(parentPath, path, cur.id);
        nodeHead[path] = newNode;
      }
      nodeHead = nodeHead[path].children;
      parentPath.push(path);
    });

    return acc;
  }, {});
  return result;
};

export const mergeFilesTrees = (
  srcTree: FileTree,
  dstTree: FileTree
): FileTree => {
  const result: FileTree = { ...dstTree };
  Object.entries(srcTree).forEach(([key, value]) => {
    if (value.type === 'file') {
      return;
    }
    if (!result[key]) {
      result[key] = { ...value, children: mergeFilesTrees(value.children, {}) };
      return;
    }
    result[key] = {
      ...result[key],
      id: value.id,
      children: mergeFilesTrees(value.children, result[key].children),
    };
  });
  return result;
};

const extractNestedFilesIds = (tree: FileTree): string[] => {
  if (!tree) {
    return [];
  }
  const result: string[] = [];
  Object.entries(tree).forEach(([_, value]) => {
    if (value.type === 'file') {
      result.push(value.id);
    }
    result.push(...extractNestedFilesIds(value.children));
  });
  return result;
};

export const deletePathFromTree = (
  tree: FileTree,
  fileNode: FileNode
): [FileTree, string[]] => {
  let node: FileTree = tree;
  fileNode.filePath.forEach((p) => {
    node = node?.[p]?.children;
    if (!node) {
      return;
    }
  });

  if (!node) {
    return [tree, []];
  }

  delete node[fileNode.name];
  if (fileNode.type === 'file') {
    return [tree, [fileNode.id]];
  }

  const deletedFileIds = extractNestedFilesIds(node[fileNode.name].children);
  return [tree, deletedFileIds];
};

export const addFileToTree = (tree: FileTree, fileNode: FileNode): FileTree => {
  let node: FileTree = tree;
  fileNode.filePath.forEach((p) => {
    node = node?.[p]?.children;
    if (!node) {
      return;
    }
  });

  if (node) {
    node[fileNode.name] = fileNode;
  }

  return tree;
};

const extractFilePathInfo = (tree?: FileTree): FilePathInfo[] => {
  if (!tree) {
    return [];
  }
  return Object.entries(tree).reduce<FilePathInfo[]>((acc, [, value]) => {
    if (value.type === 'file') {
      acc.push({ id: value.id, filePath: [...value.filePath, value.name] });
      return acc;
    }
    acc.push(...extractFilePathInfo(value.children));
    return acc;
  }, []);
};

export const updateNestedFilePath = (
  fileTree: FileTree,
  path: string,
  index: number
): void => {
  Object.values(fileTree).forEach((value) => {
    value.filePath[index] = path;
    if (value.type === 'folder') {
      updateNestedFilePath(value.children, path, index);
    }
  });
};

export const renameFileInTree = (
  tree: FileTree,
  fileNode: FileNode,
  newName: string
): [FileTree, FilePathInfo[]] => {
  let node: FileTree = tree;
  fileNode.filePath.forEach((p) => {
    node = node?.[p]?.children;
    if (!node) {
      return;
    }
  });

  if (!node) {
    return [tree, []];
  }
  const oldNode = node[fileNode.name];
  delete node[fileNode.name];
  node[newName] = { ...oldNode, name: newName };

  if (node[newName].children) {
    updateNestedFilePath(
      node[newName].children,
      newName,
      node[newName].filePath.length
    );
  }

  if (node[newName].type === 'file') {
    return [tree, extractFilePathInfo(node)];
  }

  return [tree, extractFilePathInfo(node[newName]?.children)];
};

export const convertFlatTreeToFileTree = (flatTree: FlatTree): FileNode => {
  const newNode: FileNode = {
    name: flatTree.name,
    filePath: flatTree.filePath,
    type: flatTree.type,
    id: flatTree.id,
    children: Object.values(flatTree.children ?? {}).reduce<FileTree>(
      (acc, cur) => ({
        ...acc,
        [cur.name]: convertFlatTreeToFileTree(cur),
      }),
      {}
    ),
  };
  return newNode;
};
