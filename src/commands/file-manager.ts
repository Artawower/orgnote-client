import type { CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, getFileName, I18N, type Command } from 'orgnote-api';
import { createFileCompletion } from 'src/composables/create-file-completion';
import { useFileRenameCompletion } from 'src/composables/file-rename-completion';
import { getFileDirPath } from 'src/utils/get-file-dir-path';
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
        const fm = api.core.useFileManager();
        await fm.createFolder();
      },
    },
    {
      command: DefaultCommands.CREATE_FILE,
      group,
      icon: 'sym_o_edit_document',
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        const filePath = await createFileCompletion(api);
        if (!filePath) {
          return;
        }
        const dirPath = getFileDirPath(filePath);
        fm.path = dirPath;
        await fm.createFile();
      },
    },
    {
      command: DefaultCommands.CREATE_NOTE,
      group: 'file manager',
      icon: 'o_add_box',
      handler: async (api: OrgNoteApi) => {
        const fm = api.core.useFileManager();
        await fm.createFile();
      },
    },
    {
      command: DefaultCommands.RENAME_FILE,
      group,
      icon: 'sym_o_edit',
      handler: async (api: OrgNoteApi, params: CommandHandlerParams<string>) => {
        const fm = api.core.useFileManager();
        useFileRenameCompletion(api, fm.focusFile.path);
        console.log(
          '✎: [line 78][file-manager.ts] api: OrgNoteApi, filePath: string: ',
          api,
          params,
        );
        return;
      },
    },
    {
      command: DefaultCommands.DELETE_FILE,
      group,
      icon: 'sym_o_delete',
      handler: async (api: OrgNoteApi, params: CommandHandlerParams<string>) => {
        const { confirm } = api.ui.useConfirmationModal();
        const fm = api.core.useFileManager();
        const fileName = getFileName(params.data);
        const ok = await confirm({
          title: fileName,
          message: I18N.CONFIRM_FILE_DELETION,
        });

        if (ok) {
          await fm.deleteFile(params.data);
        }
      },
    },
  ];

  return commands;
}
