import type { Command } from 'orgnote-api';
import { DefaultCommands, RouteNames } from 'orgnote-api';
import { api } from 'src/boot/api';
// import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
// import { Platform } from 'quasar';
// import FileManagerSideBar from 'src/components/containers/FileManagerSideBar.vue';
import { ISSUE_PAGE } from 'src/constants/issue-page';
import TheSettings from 'src/containers/TheSettings.vue';
// import { useSidebarStore } from 'src/stores/sidebar';
// import DebugPage from 'src/pages/DebugPage.vue';
// import LoggerPage from 'src/pages/LoggerPage.vue';
// import ProjectInfo from 'src/pages/ProjectInfo.vue';
import { clientOnly } from 'src/utils/platform-specific';
import type { Router } from 'vue-router';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getGlobalCommands({ router }: { router?: Router } = {}): Command[] {
  const sidebarStore = api.ui.useSidebar();
  const modal = api.ui.useModal();
  const commands: Command[] = [
    {
      command: DefaultCommands.REPORT_BUG,
      description: 'report bug',
      group: 'debug',
      handler: clientOnly(() => window.open(ISSUE_PAGE, '_blank')),
    },
    {
      command: DefaultCommands.OPEN_DEBUG_INFO,
      description: 'open debug info',
      group: 'debug',
      handler: () => {
        // TODO: feat/stable-beta
        // modalStore.open(DebugPage, { title: 'system info' });
      },
    },
    {
      command: DefaultCommands.SHOW_LOGS,
      description: 'show logs',
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
      description: 'toggle sidebar',
      handler: () => {
        sidebarStore.toggle();
      },
    },
    {
      command: DefaultCommands.TOGGLE_FILE_MANAGER,
      group: 'global',
      icon: 'folder',
      description: 'toggle file manager',
      handler: () => {
        // sidebarStore.toggleWithComponent(FileManagerSideBar);
      },
    },
    {
      command: DefaultCommands.SETTINGS,
      group: 'global',
      icon: 'settings',
      handler: () =>
        modal.open(TheSettings, {
          title: 'settings',
          closable: true,
          modalProps: {
            initialRoute: RouteNames.SystemSettings,
          },
        }),
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
      description: 'show project info',
      group: 'global',
      handler: () => {
        // modalStore.open(ProjectInfo),
      },
    },
    {
      command: DefaultCommands.SYNC_FILES,
      icon: 'sync',
      description: 'sync files',
      group: 'global',
      handler: () => {
        // notesStore.syncWithFs();
        // fileManagerStore.updateFileManager();
      },
    },
    {
      command: DefaultCommands.ENCRYPT_NOTE,
      icon: 'sym_o_encrypted',
      description: 'encrypt active note',
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
      description: 'decrypt active note',
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
  ];

  return commands;
}
