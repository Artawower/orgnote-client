import { useNoteCreatorStore } from './note-creator';
import { useNotesStore } from './notes';
import { defineStore } from 'pinia';
import { repositories } from 'src/boot/repositories';
import { FileNode, FileNodeInfo, FileTree } from 'src/repositories';
import {
  addFileToTree,
  buildFileTree,
  convertFileTreeToFlatTree,
  debounce,
  deletePathFromTree,
  getUniqueFileName,
  mergeFilesTrees,
  renameFileInTree,
  toDeepRaw,
} from 'src/tools';
import { v4 } from 'uuid';

import { computed, ref } from 'vue';

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

  const createFolder = async (fileNode?: FileNodeInfo) => {
    const initialName = 'Untitled';
    const filePath = fileNode ? [...fileNode.filePath, fileNode.name] : [];
    const newItem: FileNode = {
      name: initialName,
      filePath,
      id: v4(),
      type: 'folder',
      children: {},
    };
    editedFileItem.value = newItem;

    fileTree.value = addFileToTree(fileTree.value, newItem);
    await storePersistently();
  };

  const noteCreatorStore = useNoteCreatorStore();

  const createFile = async (parentFileNode?: FileNode) => {
    const children = parentFileNode?.children ?? fileTree.value;
    const noteName = getUniqueFileName(children);
    const id = v4();

    const filePath = parentFileNode
      ? [
          ...(parentFileNode?.filePath ?? []),
          parentFileNode.name,
          `${noteName}.org`,
        ]
      : [`${noteName}.org`];

    const newFile: FileNode = {
      name: noteName,
      filePath,
      id,
      type: 'file',
    };
    fileTree.value = addFileToTree(fileTree.value, newFile);
    editedFileItem.value = newFile;
    await noteCreatorStore.create(id, newFile.filePath);
    await storePersistently();
  };

  const stopEdit = () => {
    editedFileItem.value = null;
  };

  const fileManager = computed(() => {
    return convertFileTreeToFlatTree(fileTree.value);
  });

  const notesStore = useNotesStore();
  const deleteFile = async (fileNode: FileNodeInfo) => {
    const [updatedFileTree, deletedFileIds] = deletePathFromTree(
      fileTree.value,
      fileNode
    );
    fileTree.value = updatedFileTree;
    await notesStore.markAsDeleted(deletedFileIds);
    await storePersistently();
  };

  const renameFile = async (fileNode: FileNode, newName: string) => {
    const [updatedTree, filePaths] = renameFileInTree(
      fileTree.value,
      fileNode,
      newName
    );
    fileTree.value = updatedTree;
    const notesUpdates = filePaths.map((fp) => ({
      id: fp.id,
      changes: { filePath: fp.filePath },
    }));
    await notesStore.bulkPathNotesLocally(notesUpdates);
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
