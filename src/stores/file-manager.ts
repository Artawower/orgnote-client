import { defineStore } from 'pinia';
import { debounce } from 'src/tools';

import { onMounted, ref } from 'vue';
import {
  FILE_SYSTEM_MUTATION_ACTIONS,
  useFileSystemStore,
} from 'src/stores/file-system.store';
import { FileTree } from 'src/models/file-tree.model';
import { v4 } from 'uuid';
import { SortType } from 'src/models/sort-type.model';
import { FileInfo } from 'orgnote-api';

export const useFileManagerStore = defineStore('file-manager', () => {
  const fileTrees = ref<FileTree[]>([]);
  const editedFileItem = ref<FileTree | null>();
  const expandedNodes = ref<string[]>([]);
  const fileSystem = useFileSystemStore();

  onMounted(async () => {
    watchFileSystemChanges();
    updateFileManager();
  });

  const watchFileSystemChanges = () => {
    fileSystem.$onAction(({ after, name }) => {
      if (!FILE_SYSTEM_MUTATION_ACTIONS.includes(name)) {
        return;
      }
      after(() => {
        updateFileManager();
      });
    });
  };

  const syncFiles = async () => {
    const files = await fileSystem.getFilesInDir();
    fileTrees.value = sortFileTrees(await extractFiles(files));
  };

  const extractFiles = async (
    files: FileInfo[],
    parentDir: string[] = []
  ): Promise<FileTree[]> => {
    const fileTrees: FileTree[] = [];

    for (const f of files) {
      fileTrees.push(await createFileTree(f, parentDir));
    }

    return fileTrees;
  };

  const sortFileTrees = (
    fileTrees: FileTree[],
    { directory = 'asc' }: { directory?: SortType } = {}
  ): FileTree[] => {
    const compare = (a: FileTree, b: FileTree) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      if (directory === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    };

    return [...fileTrees].sort(compare).map((fileTree) => ({
      ...fileTree,
      children: fileTree.children
        ? sortFileTrees(fileTree.children, { directory })
        : undefined,
    }));
  };

  const createFileTree = async (
    file: FileInfo,
    parentPath: string[] = []
  ): Promise<FileTree> => {
    const children =
      file.type === 'directory'
        ? await extractFiles(await fileSystem.getFilesInDir(file.name), [
            ...parentPath,
            file.name,
          ])
        : undefined;

    return {
      id: file.name,
      type: file.type,
      name: file.name,
      filePath: [...parentPath, file.name],
      children,
    };
  };

  const updateFileManager = debounce(syncFiles, 50);

  const createFolder = async () => {
    const initialName = 'Untitled';
    const filePath: string[] = [];

    const newItem: FileTree = {
      name: initialName,
      filePath,
      id: v4(),
      type: 'directory',
      children: [],
    };
    editedFileItem.value = newItem;
    await fileSystem.mkdir(`${filePath}${initialName}`);

    fileTrees.value = [newItem, ...fileTrees.value];
  };

  const stopEdit = () => {
    editedFileItem.value = null;
  };

  const deleteFile = async (fileTree: FileTree) => {
    const deletePath = [...fileTree.filePath];
    await fileSystem.deleteFile(deletePath);
  };

  const renameFile = async (fileTree: FileTree, newName: string) => {
    const newFilePath = [...fileTree.filePath.slice(0, -1), newName];
    await fileSystem.rename(fileTree.filePath, newFilePath);
  };

  const getPathsFromDir = (fileTree: FileTree): string[][] => {
    const filePaths: string[][] = [];

    if (fileTree.type === 'file') {
      filePaths.push(fileTree.filePath);
    }

    for (const child of fileTree?.children) {
      filePaths.push(...getPathsFromDir(child));
    }

    return filePaths;
  };

  onMounted(() => updateFileManager());

  return {
    fileTrees,
    renameFile,
    deleteFile,
    updateFileManager,
    createFolder,
    editedFileItem,
    stopEdit,
    expandedNodes,
  };
});
