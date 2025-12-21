import type { Command } from 'orgnote-api';
import { DefaultCommands, i18n, I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import { GITHUB_LINK, PATREON_LINK, WIKI_LINK } from 'src/constants/external-link';
import { ISSUE_PAGE } from 'src/constants/issue-page';
import { clientOnly } from 'src/utils/platform-specific';
import type { Router } from 'vue-router';
import LogsContainer from 'src/containers/LogsContainer.vue';
import SystemInfoContainer from 'src/containers/SystemInfoContainer.vue';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { isNotActiveUser } from './command-guards';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getGlobalCommands({ router }: { router?: Router } = {}): Command[] {
  const sidebarStore = api.ui.useSidebar();
  const modalStore = api.ui.useModal();
  const commands: Command[] = [
    {
      command: DefaultCommands.REPORT_BUG,
      group: 'debug',
      handler: clientOnly(() => window.open(ISSUE_PAGE, '_blank')),
    },
    {
      command: DefaultCommands.OPEN_SYSTEM_INFO,
      description: I18N.VISIT_DEBUG_INFO,
      icon: 'sym_o_info',
      group: 'debug',
      handler: () => {
        modalStore.open(SystemInfoContainer, { title: i18n.SYSTEM_INFO, wide: true });
      },
    },
    {
      command: DefaultCommands.SHOW_LOGS,
      group: 'debug',
      icon: 'sym_o_bug_report',
      handler: () => {
        modalStore.open(LogsContainer, { title: I18N.LOGS, wide: true });
      },
    },
    {
      command: DefaultCommands.CLEAR_LOGS,
      group: 'debug',
      icon: 'delete',
      handler: async () => {
        const { confirm } = api.ui.useConfirmationModal();

        const confirmed = await confirm({
          message: I18N.CONFIRM_CLEAR_LOGS,
        });

        if (confirmed) {
          const logStore = api.core.useLog();
          logStore.clearLogs();
        }
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
      hide: isNotActiveUser,
      disabled: isNotActiveUser,
      handler: async (api) => {
        const ok = await api.ui.useConfirmationModal().confirm({
          title: i18n.SYNC_FILES,
          message: i18n.SYNC_FILES_DESCRIPTION,
        });
        if (!ok) {
          return;
        }
        const res = await to(api.core.useSync().sync)();
        if (res.isErr()) {
          reporter.reportError(res.error);
        }
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
