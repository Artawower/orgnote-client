import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { FileNode, FileTree } from 'src/repositories';
import { repositories } from 'src/boot/repositories';
import {
  addFileToTree,
  buildFileTree,
  convertFileTreeToFlatTree,
  debounce,
  deletePathFromTree,
  mergeFilesTrees,
  renameFileInTree,
  toDeepRaw,
} from 'src/tools';

// TODO: master temporary solution. Need to use decorator and update only
// changed paths for preventing iteration over all notes. Check time.
export const useFileManagerStore = defineStore('file-manager', () => {
  const fileTree = ref<FileTree>();
  const editedFileItem = ref<FileNode | null>();

  repositories.fileManager.getAll().then((fm) => {
    fileTree.value = fm || {};
  });

  const updateFileManagerWithDebounce = debounce(async () => {
    const notesPathsInfo = await repositories.notes.getFilePaths();
    const filesBasedTree = buildFileTree(notesPathsInfo);
    fileTree.value = mergeFilesTrees(fileTree.value, filesBasedTree);
    const fileTreeEmpty = !Object.keys(fileTree.value).length;
    if (fileTreeEmpty) {
      return;
    }
    await repositories.fileManager.upsert(toDeepRaw(fileTree.value));
  }, 300);

  const updateFileManager = async () => {
    updateFileManagerWithDebounce();
  };

  const createFolder = async (fileNode?: FileNode) => {
    const initialName = 'Untitled';
    const filePath = fileNode ? [...fileNode.filePath, fileNode.name] : [];
    const newItem: FileNode = {
      name: initialName,
      filePath,
      type: 'folder',
      children: {},
    };
    editedFileItem.value = newItem;

    fileTree.value = addFileToTree(fileTree.value, newItem);
    await storePersistently();
  };

  const createFile = async (fileNode: FileNode) => {
    const initialName = 'Untitled-note.org';
    const newFile: FileNode = {
      name: initialName,
      filePath: [...fileNode.filePath, fileNode.name],
      type: 'file',
    };
    fileTree.value = addFileToTree(fileTree.value, newFile);
    editedFileItem.value = newFile;
    await storePersistently();
  };

  const stopEdit = () => {
    editedFileItem.value = null;
  };

  const fileManager = computed(() => {
    return convertFileTreeToFlatTree(fileTree.value);
  });

  const deleteFile = async (fileNode: FileNode) => {
    fileTree.value = deletePathFromTree(fileTree.value, fileNode);
    // TODO: master delete real notes ?
    await storePersistently();
  };

  const renameFile = async (fileNode: FileNode, newName: string) => {
    fileTree.value = renameFileInTree(fileTree.value, fileNode, newName);
    await storePersistently();
  };

  const storePersistently = async () =>
    await repositories.fileManager.upsert(toDeepRaw(fileTree.value));

  return {
    fileTree,
    fileManager,
    createFile,
    renameFile,
    deleteFile,
    updateFileManager,
    createFolder,
    editedFileItem,
    stopEdit,
  };
});
