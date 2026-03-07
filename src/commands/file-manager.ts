import {
  DefaultCommands,
  I18N,
  getFileName,
  join,
  type Command,
  type CommandHandlerParams,
  type FileSortConfig,
  type OrgNoteApi,
  type PendingFileOperation,
} from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { createFileCompletion } from 'src/composables/create-file-completion';
import { createFolderCompletion } from 'src/composables/create-folder-completion';
import { deleteFileCompletion } from 'src/composables/delete-file-completion';
import { useFileRenameCompletion } from 'src/composables/file-rename-completion';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { to } from 'orgnote-api/utils';
import { defineAsyncComponent } from 'vue';
import { buildSortCandidates } from 'src/composables/sort-files-completion';
import { getActiveFilePath } from 'src/utils/get-active-file-path';

const group = 'file manager';

type FileTargetsCommandData = {
  path?: string;
  paths?: string[];
  interactive?: boolean;
};

type DeleteFileCommandData = FileTargetsCommandData & {
  force?: boolean;
};

const getTargetPathsFromCommandData = (data?: FileTargetsCommandData): string[] | undefined => {
  if (data?.paths?.length) {
    return data.paths;
  }

  if (data?.path) {
    return [data.path];
  }
};

const pickDestinationPath = (api: OrgNoteApi, initialPath: string): Promise<string> => {
  return api.core.useCompletion().open<void, string>({
    type: 'input',
    searchText: initialPath,
    placeholder: I18N.PICK_FOLDER,
  });
};

const executeInteractiveTransfer = async (
  api: OrgNoteApi,
  pendingOperation: PendingFileOperation | undefined,
): Promise<void> => {
  const fm = api.core.useFileManager();
  const destinationResult = await to(pickDestinationPath, 'Failed to pick destination')(api, fm.path);
  if (destinationResult.isErr()) {
    fm.cancelPending();
    throw destinationResult.error;
  }

  const destinationPath = destinationResult.value;
  if (!destinationPath) {
    fm.cancelPending();
    return;
  }

  const executeResult = await to(fm.executePending.bind(fm), 'Failed to execute pending transfer')(
    destinationPath,
  );
  if (executeResult.isErr()) {
    fm.cancelPending();
    throw executeResult.error;
  }

  await safeSyncActiveFileAfterMove(api, pendingOperation, destinationPath);
};

const toPathPrefix = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

const remapPath = (
  activePath: string,
  previousPath: string,
  nextPath: string,
): string | undefined => {
  if (activePath === previousPath) {
    return nextPath;
  }

  const previousPrefix = toPathPrefix(previousPath);
  if (!activePath.startsWith(previousPrefix)) {
    return;
  }

  return `${nextPath}${activePath.slice(previousPath.length)}`;
};

const reopenPath = async (api: OrgNoteApi, path: string): Promise<void> => {
  const commands = api.core.useCommands();
  await commands.execute(DefaultCommands.OPEN_NOTE, { path });
};

const syncActiveFileAfterRename = async (
  api: OrgNoteApi,
  previousPath: string,
  nextPath: string,
): Promise<void> => {
  const activePath = getActiveFilePath(api);
  if (!activePath) {
    return;
  }

  const remappedPath = remapPath(activePath, previousPath, nextPath);
  if (!remappedPath) {
    return;
  }

  await reopenPath(api, remappedPath);
};

const getMoveDestinationPath = (sourcePath: string, destinationDir: string): string =>
  join(destinationDir, getFileName(sourcePath));

const syncActiveFileAfterMove = async (
  api: OrgNoteApi,
  operation: PendingFileOperation | undefined,
  destinationDir: string,
): Promise<void> => {
  if (!operation || operation.type !== 'move') {
    return;
  }

  const activePath = getActiveFilePath(api);
  if (!activePath) {
    return;
  }

  const remappedPath = operation.paths
    .map((sourcePath) => {
      const destinationPath = getMoveDestinationPath(sourcePath, destinationDir);
      return remapPath(activePath, sourcePath, destinationPath);
    })
    .find((path) => !!path);

  if (!remappedPath) {
    return;
  }

  await reopenPath(api, remappedPath);
};

const safeSyncActiveFileAfterMove = async (
  api: OrgNoteApi,
  operation: PendingFileOperation | undefined,
  destinationDir: string,
): Promise<void> => {
  const syncResult = await to(syncActiveFileAfterMove, 'Failed to sync active file after move')(
    api,
    operation,
    destinationDir,
  );

  if (syncResult.isErr()) {
    reporter.reportWarning(syncResult.error);
  }
};

const createTransferHandler =
  (startOperation: (api: OrgNoteApi, targets: string[]) => void) =>
  async (api: OrgNoteApi, params?: CommandHandlerParams<FileTargetsCommandData>): Promise<void> => {
    const fm = api.core.useFileManager();
    const targets = getTargetPathsFromCommandData(params?.data) ?? fm.operationTargets;
    if (!targets.length) return;

    startOperation(api, targets);

    if (!params?.data?.interactive) {
      return;
    }

    await executeInteractiveTransfer(api, fm.pendingOperation);
};

export function getFileManagerCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.MAXIMIZE_FILE_MANAGER,
      group,
      icon: 'sym_o_fit_screen',
      handler: (api: OrgNoteApi) => {
        const modal = api.ui.useModal();
        modal.open(
          defineAsyncComponent(() => import('src/containers/FileManager.vue')),
          {
            modalProps: {
              closable: true,
            },
            modalEmits: {
              close: () => modal.close(),
            },
          },
        );
      },
    },
    {
      command: DefaultCommands.TOGGLE_FILE_MANAGER,
      group,
      icon: 'folder',
      handler: (api: OrgNoteApi) => {
        const sidebar = api.ui.useSidebar();
        if (sidebar.opened) {
          sidebar.close();
          return;
        }
        sidebar.openComponent(
          defineAsyncComponent(() => import('src/containers/FileManager.vue')),
          {
            componentProps: {
              closable: false,
              tree: true,
              compact: true,
            },
          },
        );
      },
    },
    {
      command: DefaultCommands.CREATE_FOLDER,
      group,
      icon: 'sym_o_create_new_folder',
      handler: async (api: OrgNoteApi) => {
        const res = await to(createFolderCompletion, 'Failed to create folder')(api);
        if (res.isErr()) {
          reporter.reportError(res.error);
        }
      },
    },
    {
      command: DefaultCommands.CREATE_NOTE,
      group: 'file manager',
      icon: 'o_add_box',
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const filePath = await createFileCompletion(api);
        if (!filePath) {
          return;
        }
        const dirPath = getFileDirPath(filePath);
        fm.path = dirPath;

        const commands = api.core.useCommands();
        await commands.execute(DefaultCommands.OPEN_NOTE, { path: filePath });
      },
    },
    {
      command: DefaultCommands.RENAME_FILE,
      group,
      icon: 'sym_o_edit',
      handler: async (api: OrgNoteApi, params: CommandHandlerParams<FileTargetsCommandData>) => {
        const fm = api.core.useFileManager();
        const targetPath = params?.data?.path ?? fm.focusFile?.path;
        if (!targetPath) {
          return;
        }
        const nextPath = await useFileRenameCompletion(api, targetPath);
        if (!nextPath) {
          return;
        }
        await syncActiveFileAfterRename(api, targetPath, nextPath);
      },
    },
    {
      command: DefaultCommands.SHOW_MOBILE_FILE_SEARCH,
      group,
      icon: 'search',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        fm.mobileFileSearchActive = true;
      },
      hide: (api: OrgNoteApi) => !api.ui.useScreenDetection().tabletBelow.value,
    },
    {
      command: DefaultCommands.HIDE_MOBILE_FILE_SEARCH,
      group,
      icon: 'close',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        fm.mobileFileSearchActive = false;
        fm.searchQuery = '';
      },
      hide: (api: OrgNoteApi) => !api.ui.useScreenDetection().tabletBelow.value,
    },
    {
      command: DefaultCommands.DELETE_FILE,
      group,
      icon: 'sym_o_delete',
      handler: async (
        api: OrgNoteApi,
        params: CommandHandlerParams<DeleteFileCommandData>,
      ) => {
        const fm = api.core.useFileManager();
        const paths = getTargetPathsFromCommandData(params?.data);
        const targets = paths ?? fm.operationTargets;

        if (!targets.length) {
          await deleteFileCompletion(api);
          return;
        }

        if (params?.data?.force) {
          const fs = api.core.useFileSystem();
          await Promise.all(targets.map((p) => fs.deleteFile(p)));
          fm.clearSelection();
          return;
        }

        return deleteWithConfirmation(api, targets);
      },
    },
    {
      command: DefaultCommands.COPY_FILE,
      group,
      icon: 'sym_o_content_copy',
      handler: createTransferHandler((api, targets) => api.core.useFileManager().startCopy(targets)),
    },
    {
      command: DefaultCommands.MOVE_FILE,
      group,
      icon: 'sym_o_drive_file_move',
      handler: createTransferHandler((api, targets) => api.core.useFileManager().startMove(targets)),
    },
    {
      command: DefaultCommands.EXECUTE_PENDING_FILE_OPERATION,
      group,
      icon: 'sym_o_content_paste',
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const pendingOperation = fm.pendingOperation;
        await fm.executePending(fm.path);
        await safeSyncActiveFileAfterMove(api, pendingOperation, fm.path);
      },
    },
    {
      command: DefaultCommands.CANCEL_PENDING_FILE_OPERATION,
      group,
      icon: 'close',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        fm.cancelPending();
      },
    },
    {
      command: DefaultCommands.SELECT_FILE,
      group,
      icon: 'sym_o_check_circle',
      handler: (api: OrgNoteApi, params: CommandHandlerParams<FileTargetsCommandData>) => {
        const fm = api.core.useFileManager();
        const targetPath = params?.data?.path ?? fm.focusFile?.path;
        if (!targetPath) return;

        fm.toggleSelection(targetPath);
      },
    },
    {
      command: DefaultCommands.SELECT_ALL_FILES,
      group,
      icon: 'sym_o_select_all',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        fm.selectFiles([...fm.files]);
      },
    },
    {
      command: DefaultCommands.DESELECT_ALL_FILES,
      group,
      icon: 'sym_o_deselect',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        fm.clearSelection();
      },
    },
    {
      command: DefaultCommands.SORT_FILES,
      group,
      icon: 'sym_o_sort',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const completion = api.core.useCompletion();

        completion.open<FileSortConfig>({
          placeholder: I18N.SORT_FILES,
          type: 'choice',
          itemsGetter: () => buildSortCandidates(fm.sortConfig),
        });
      },
    },
  ];

  return commands;
}

const deleteWithConfirmation = async (api: OrgNoteApi, paths: string[]): Promise<void> => {
  const confirmModal = api.ui.useConfirmationModal();
  const message = paths.length === 1 ? paths[0] : `${paths.length} files`;
  const confirmed = await confirmModal.confirm({
    title: I18N.CONFIRM_DELETE_FILE,
    message,
  });

  if (!confirmed) return;

  const fm = api.core.useFileManager();
  await fm.deleteFiles(paths);
};
