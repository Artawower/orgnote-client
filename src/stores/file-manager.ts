import { getFileName, join, type DiskFile, type FileManagerStore, type PendingFileOperation } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, ref, shallowRef } from 'vue';
import { useFileSystemStore } from './file-system';
import { getUniqueFileName } from 'src/utils/unique-file-name';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { isFilePath } from 'src/utils/is-file-path';
import { DEFAULT_FOLDER_NAME } from 'src/constants/default-folder-name';

export const useFileManagerStore = defineStore<string, FileManagerStore>('file-manager', () => {
  const path = ref<string>('/');
  const focusFile = shallowRef<DiskFile | undefined>();
  const searchQuery = ref<string>('');
  const mobileFileSearchActive = ref<boolean>(false);

  const selectedFiles = ref(new Set<string>());
  const selectionMode = computed(() => selectedFiles.value.size > 0);

  const fs = useFileSystemStore();

  const focusDirPath = computed<string>(() => {
    if (!path.value) {
      return '/';
    }
    if (isFilePath(path.value)) {
      return getFileDirPath(path.value);
    }
    return path.value;
  });

  const operationTargets = computed<string[]>(() => {
    if (selectedFiles.value.size > 0) return [...selectedFiles.value];
    if (focusFile.value?.path) return [focusFile.value.path];
    return [];
  });

  const toggleSelection = (filePath: string): void => {
    const next = new Set(selectedFiles.value);
    const toggle = next.has(filePath) ? next.delete.bind(next) : next.add.bind(next);
    toggle(filePath);
    selectedFiles.value = next;
  };

  const selectFiles = (files: DiskFile[]): void => {
    selectedFiles.value = new Set(files.map((f) => f.path));
  };

  const clearSelection = (): void => {
    selectedFiles.value = new Set();
  };

  const pendingOperation = ref<PendingFileOperation | undefined>();

  const startCopy = (paths: string[]): void => {
    pendingOperation.value = { type: 'copy', paths };
    clearSelection();
  };

  const startMove = (paths: string[]): void => {
    pendingOperation.value = { type: 'move', paths };
    clearSelection();
  };

  const executePending = async (dest: string): Promise<void> => {
    if (!pendingOperation.value) return;
    const { type, paths } = pendingOperation.value;
    const execute = type === 'copy' ? copyFiles : moveFiles;
    await execute(paths, dest);
    pendingOperation.value = undefined;
  };

  const cancelPending = (): void => {
    pendingOperation.value = undefined;
  };

  const transferFiles = async (
    paths: string[],
    dest: string,
    operation: (src: string, dest: string) => Promise<void>,
  ): Promise<void> => {
    await Promise.all(
      paths.map((src) => operation(src, join(dest, getFileName(src)))),
    );
    clearSelection();
  };

  const copyFiles = (paths: string[], dest: string) => transferFiles(paths, dest, fs.copyFile);
  const moveFiles = (paths: string[], dest: string) => transferFiles(paths, dest, fs.rename);

  const deleteFiles = async (paths: string[]): Promise<void> => {
    await Promise.all(paths.map((p) => fs.deleteFile(p)));
    clearSelection();
  };

  const createFile = async (p?: string): Promise<void> => {
    if (p) {
      await fs.writeFile(p, '');
      return;
    }
    const files = (await fs.readDir(path.value)).map((f) => f.name);
    const fileName = getUniqueFileName(files);
    await fs.writeFile(join(path.value, fileName), '');
  };

  const createFolder = async (p?: string): Promise<void> => {
    if (p) {
      await fs.mkdir(p);
      return;
    }
    const files = (await fs.readDir(path.value)).map((f) => f.name);
    const folderName = getUniqueFileName(files, '', DEFAULT_FOLDER_NAME);
    const folderPath = join(path.value, folderName);
    await fs.mkdir(folderPath);
  };

  const store: FileManagerStore = {
    path,
    focusFile,
    searchQuery,
    mobileFileSearchActive,
    focusDirPath,

    selectionMode,
    selectedFiles,
    operationTargets,
    pendingOperation,
    toggleSelection,
    selectFiles,
    clearSelection,

    startCopy,
    startMove,
    executePending,
    cancelPending,

    copyFiles,
    moveFiles,
    deleteFiles,
    createFile,
    createFolder,
  };

  return store;
});
