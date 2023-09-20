import { FileTree, FilePathInfo, FileNode } from 'src/repositories';

export interface FlatTree extends Omit<FileNode, 'children'> {
  children: FlatTree[];
}

// TODO: master convert to class or hook
const createHashNode = (
  parentPath: string[],
  path: string,
  id?: string
): FileNode => {
  const isFileName = path.includes('.');
  return {
    name: path,
    filePath: [...parentPath],
    id: isFileName ? id : undefined,
    type: isFileName ? 'file' : 'folder',
    children: {},
  };
};

const convertToFileTree = (tree: FilePathInfo[]): FileTree => {
  const result = tree.reduce<FileTree>((acc: FileTree, cur: FilePathInfo) => {
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
  const fileTree = convertToFileTree(info);
  return fileTree;
};

export const mergeFilesTrees = (
  srcTree: FileTree,
  dstTree: FileTree
): FileTree => {
  const result: FileTree = { ...dstTree };
  Object.entries(srcTree).forEach(([key, value]) => {
    if (result[key]) {
      result[key] = {
        ...result[key],
        children: mergeFilesTrees(value.children, result[key].children),
      };
    } else {
      result[key] = value;
    }
  });
  return result;
};

export const deletePathFromTree = (
  tree: FileTree,
  fileNode: FileNode
): FileTree => {
  let node: FileTree = tree;
  fileNode.filePath.forEach((p) => {
    node = node?.[p]?.children;
    if (!node) {
      return;
    }
  });

  if (node) {
    delete node[fileNode.name];
  }

  return tree;
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

export const renameFileInTree = (
  tree: FileTree,
  fileNode: FileNode,
  newName: string
): FileTree => {
  let node: FileTree = tree;
  fileNode.filePath.forEach((p) => {
    node = node?.[p]?.children;
    if (!node) {
      return;
    }
  });

  if (node) {
    const oldNode = node[fileNode.name];
    delete node[fileNode.name];
    node[newName] = { ...oldNode, name: newName };
  }

  return tree;
};
