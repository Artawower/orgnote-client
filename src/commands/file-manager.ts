import type { CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N, type Command } from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { createFileCompletion } from 'src/composables/create-file-completion';
import { createFolderCompletion } from 'src/composables/create-folder-completion';
import { deleteFileCompletion } from 'src/composables/delete-file-completion';
import { useFileRenameCompletion } from 'src/composables/file-rename-completion';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
import { to } from 'orgnote-api/utils';
import { isNullable } from 'orgnote-api/utils';
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
      command: DefaultCommands.DELETE_FILE,
      group,
      icon: 'sym_o_delete',
      handler: async (
        api: OrgNoteApi,
        params: CommandHandlerParams<{
          path?: string;
          force?: boolean;
        }>,
      ) => {
        if (!params.data) {
          await deleteFileCompletion(api);
          return;
        }

        const fs = api.core.useFileSystem();
        if (params?.data?.force) {
          await fs.deleteFile(params.data.path!);
          return;
        }

        if (isNullable(params?.data?.path)) {
          return;
        }

        const confirmModal = api.ui.useConfirmationModal();
        const del = await confirmModal.confirm({
          title: I18N.CONFIRM_DELETE_FILE,
          message: params.data.path,
        });

        if (!del) {
          return;
        }
        await fs.deleteFile(params.data.path);
        return;
      },
    },
  ];

  return commands;
}
