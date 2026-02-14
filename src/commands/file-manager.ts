import type { CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N, type Command } from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { createFileCompletion } from 'src/composables/create-file-completion';
import { createFolderCompletion } from 'src/composables/create-folder-completion';
import { deleteFileCompletion } from 'src/composables/delete-file-completion';
import { useFileRenameCompletion } from 'src/composables/file-rename-completion';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { to } from 'orgnote-api/utils';
import { defineAsyncComponent } from 'vue';

const group = 'file manager';

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
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        if (!fm.focusFile) {
          return;
        }
        useFileRenameCompletion(api, fm.focusFile.path);
        return;
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
        params: CommandHandlerParams<{
          path?: string;
          paths?: string[];
          force?: boolean;
        }>,
      ) => {
        const fm = api.core.useFileManager();
        const paths = params?.data?.paths ?? (params?.data?.path ? [params.data.path] : null);
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
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const targets = fm.operationTargets;
        if (!targets.length) return;
        fm.startCopy(targets);
      },
    },
    {
      command: DefaultCommands.MOVE_FILE,
      group,
      icon: 'sym_o_drive_file_move',
      handler: (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const targets = fm.operationTargets;
        if (!targets.length) return;
        fm.startMove(targets);
      },
    },
    {
      command: DefaultCommands.EXECUTE_PENDING_FILE_OPERATION,
      group,
      icon: 'sym_o_content_paste',
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        await fm.executePending(fm.path);
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
      handler: (
        api: OrgNoteApi,
        params: CommandHandlerParams<{ path?: string }>,
      ) => {
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
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const fs = api.core.useFileSystem();
        const files = await fs.readDir(fm.path);
        fm.selectFiles(files);
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


