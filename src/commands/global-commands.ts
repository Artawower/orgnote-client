import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import { GITHUB_LINK, PATREON_LINK, WIKI_LINK } from 'src/constants/external-link';
import { ISSUE_PAGE } from 'src/constants/issue-page';
import { clientOnly } from 'src/utils/platform-specific';
import { defineAsyncComponent } from 'vue';
import type { Router } from 'vue-router';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getGlobalCommands({ router }: { router?: Router } = {}): Command[] {
  const sidebarStore = api.ui.useSidebar();
  const commands: Command[] = [
    {
      command: DefaultCommands.REPORT_BUG,
      group: 'debug',
      handler: clientOnly(() => window.open(ISSUE_PAGE, '_blank')),
    },
    {
      command: DefaultCommands.OPEN_DEBUG_INFO,
      description: I18N.VISIT_DEBUG_INFO,
      group: 'debug',
      handler: () => {
        // TODO: feat/stable-beta
        // modalStore.open(DebugPage, { title: 'system info' });
      },
    },
    {
      command: DefaultCommands.SHOW_LOGS,
      group: 'debug',
      handler: () => {
        // modalStore.open(LoggerPage, { title: 'logs' });
      },
    },
    {
      command: DefaultCommands.TOGGLE_SIDEBAR,
      group: 'global',
      icon: () => {
        // TODO: feat/stable-beta also make as ref
        return sidebarStore.opened ? 'arrow_circle_left' : 'menu';
      },
      handler: () => {
        sidebarStore.toggle();
      },
    },
    {
      command: DefaultCommands.TOGGLE_FILE_MANAGER,
      group: 'global',
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
        // sidebarStore.toggleWithComponent(FileManagerSideBar);
      },
    },
    {
      command: DefaultCommands.CREATE_NOTE,
      group: 'global',
      icon: 'o_add_box',
      handler: () => {
        // if (!config.vault.path && Platform.is.nativeMobile) {
        //   router.push({ name: RouteNames.SynchronisationSettings });
        //   return;
        // }
        // noteCreatorStore.create();
      },
    },
    {
      command: DefaultCommands.PROJECT_INFO,
      icon: 'o_info',
      group: 'global',
      handler: () => {
        // modalStore.open(ProjectInfo),
      },
    },
    {
      command: DefaultCommands.SYNC_FILES,
      icon: 'sync',
      group: 'global',
      handler: () => {
        // notesStore.syncWithFs();
        // fileManagerStore.updateFileManager();
      },
    },
    {
      command: DefaultCommands.ENCRYPT_NOTE,
      icon: 'sym_o_encrypted',
      description: I18N.ENCRYPT_ACTIVE_NOTE,
      // description: 'encrypt active note',
      // disabled: () =>
      //   config.encryption.type === ModelsPublicNoteEncryptionTypeEnum.Disabled ||
      //   !currentNoteStore.currentNote ||
      //   currentNoteStore.currentNote.encrypted,
      group: 'global',
      handler: async () => {
        // const path = currentNoteStore.currentNote.filePath;
        // const newFilePath = [...path.slice(0, -1), `${path.at(-1)}.gpg`];
        // await fileSystemStore.writeFile(newFilePath, currentNoteStore.noteText);
        // noteEditorStore.setFilePath(newFilePath);
        // await fileSystemStore.deleteFile(path);
      },
    },
    {
      command: DefaultCommands.DECRYPT_NOTE,
      icon: 'sym_o_remove_moderator',
      description: I18N.DECRYPT_ACTIVE_NOTE,
      // disabled: () =>
      //   config.encryption.type === ModelsPublicNoteEncryptionTypeEnum.Disabled ||
      //   !currentNoteStore.currentNote?.encrypted,
      group: 'global',
      handler: async () => {
        // const path = currentNoteStore.currentNote.filePath;
        // const newFileName = path.at(-1).replace(/\.gpg$/, '');
        // const newFilePath = [...path.slice(0, -1), newFileName];
        // await fileSystemStore.writeFile(newFilePath, currentNoteStore.noteText);
        // noteEditorStore.setFilePath(newFilePath);
        // await fileSystemStore.deleteFile(path);
      },
    },
    {
      command: DefaultCommands.SOURCE_CODE,
      icon: 'fa-brands fa-github-alt',
      description: I18N.CHECK_GITHUB_SOURCE_CODE,
      group: 'global',
      handler: () => window.open(GITHUB_LINK, '_blank'),
    },
    {
      command: DefaultCommands.READ_WIKI,
      icon: 'sym_o_help',
      group: 'global',
      handler: () => window.open(WIKI_LINK, '_blank'),
    },
    {
      command: DefaultCommands.SPONSOR,
      icon: 'sym_o_savings',
      group: 'global',
      handler: () => window.open(PATREON_LINK, '_blank'),
    },
  ];

  return commands;
}
