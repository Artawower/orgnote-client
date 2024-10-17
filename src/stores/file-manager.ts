import { defineStore } from 'pinia';
import { debounce } from 'src/tools';

import { onMounted, ref } from 'vue';
import {
  FILE_SYSTEM_MUTATION_ACTIONS,
  useFileSystemStore,
} from 'src/stores/file-system.store';
import { v4 } from 'uuid';
import { SortType } from 'src/models/sort-type.model';
import { FileInfo, FileManagerStore, FileNode, join } from 'orgnote-api';

export const useFileManagerStore = defineStore<string, FileManagerStore>(
  'file-manager',
  (): FileManagerStore => {
    const fileTree = ref<FileNode[]>([]);
    const editedFileItem = ref<FileNode | null>();
    const expandedNodes = ref<string[]>([]);
    const fileSystemStore = useFileSystemStore();

    onMounted(async () => {
      watchFileSystemChanges();
      updateFileManager();
    });

    const watchFileSystemChanges = () => {
      fileSystemStore.$onAction(({ after, name }) => {
        if (!FILE_SYSTEM_MUTATION_ACTIONS.includes(name)) {
          return;
        }
        after(() => {
          updateFileManager();
        });
      });
    };

    const syncFiles = async () => {
      const files = await fileSystemStore.readDir();
      console.log('✎: [line 39][file-manager.ts] files: ', files);
      fileTree.value = sortFileNodes(await extractFiles(files));
    };

    const extractFiles = async (
      files: FileInfo[],
      parentDir: string[] = []
    ): Promise<FileNode[]> => {
      const fileTrees: FileNode[] = [];

      for (const f of files) {
        fileTrees.push(await createFileNode(f, parentDir));
      }

      return fileTrees;
    };

    const sortFileNodes = (
      fileTrees: FileNode[],
      { directory = 'asc' }: { directory?: SortType } = {}
    ): FileNode[] => {
      const compare = (a: FileNode, b: FileNode) => {
        if (a.type === 'directory' && b.type !== 'directory') return -1;
        if (a.type !== 'directory' && b.type === 'directory') return 1;
        if (directory === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      };

      return [...fileTrees].sort(compare).map((fileTree) => ({
        ...fileTree,
        children: fileTree.children
          ? sortFileNodes(fileTree.children, { directory })
          : undefined,
      }));
    };

    const createFileNode = async (
      file: FileInfo,
      parentPath: string[] = []
    ): Promise<FileNode> => {
      const filePath = [...parentPath, file.name];
      const children =
        file.type === 'directory'
          ? await extractFiles(await fileSystemStore.readDir(filePath), [
              ...parentPath,
              file.name,
            ])
          : undefined;

      return {
        id: file.name,
        type: file.type,
        name: file.name,
        filePath,
        children,
      };
    };

    const updateFileManager = debounce(syncFiles, 50);

    const createFolder = async (filePath: string[] = [], name = 'Untitled') => {
      const newItem: FileNode = {
        name: name,
        filePath,
        id: v4(),
        type: 'directory',
        children: [],
      };
      editedFileItem.value = newItem;

      const path = join(...filePath, name);
      await fileSystemStore.mkdir(path);
      await syncFiles();
    };

    const stopEdit = () => {
      editedFileItem.value = null;
    };

    const deleteFile = async (fileTree: FileNode) => {
      const deletePath = [...fileTree.filePath];
      if (fileTree.type === 'directory') {
        await fileSystemStore.rmdir(deletePath);
        return;
      }
      await fileSystemStore.deleteFile(deletePath);
    };

    const renameFile = async (fileTree: FileNode, newName: string) => {
      newName = newName.trim();
      const newFilePath = [...fileTree.filePath.slice(0, -1), newName];
      await fileSystemStore.rename(fileTree.filePath, newFilePath);
    };

    onMounted(() => updateFileManager());

    return {
      fileTree,
      renameFile,
      deleteFile,
      updateFileManager,
      createFolder,
      editedFileItem,
      stopEdit,
      expandedNodes,
    };
  }
);
