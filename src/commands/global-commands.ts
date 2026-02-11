import type { Command } from 'orgnote-api';
import { DefaultCommands, i18n, I18N, isOrgGpgFile, buildBufferUri } from 'orgnote-api';
import { api } from 'src/boot/api';
import { GITHUB_LINK, PATREON_LINK, WIKI_LINK } from 'src/constants/external-link';
import { ISSUE_PAGE } from 'src/constants/issue-page';
import { clientOnly } from 'src/utils/platform-specific';
import LogsContainer from 'src/containers/LogsContainer.vue';
import SystemInfoContainer from 'src/containers/SystemInfoContainer.vue';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { isNotActiveUser } from './command-guards';

const getActiveFilePath = (): string | undefined => {
  const tab = api.core.usePane().activeTab;
  const path = tab?.router.currentRoute.value?.params?.path;
  if (!path) return;
  return Array.isArray(path) ? path.join('/') : path;
};

const isEncryptionEnabled = (): boolean =>
  api.core.useConfig().config.encryption.type !== 'disabled';

const isActiveFileEncrypted = (): boolean => {
  const path = getActiveFilePath();
  return !!path && isOrgGpgFile(path);
};

const isEncryptCommandDisabled = (): boolean => !isEncryptionEnabled() || !getActiveFilePath() || isActiveFileEncrypted();

const isDecryptCommandDisabled = (): boolean => !isEncryptionEnabled() || !getActiveFilePath() || !isActiveFileEncrypted();

const ensureDestinationAvailable = async (path: string): Promise<void> => {
  const fm = api.core.useFileSystemManager();
  if (!fm.currentFs) return;
  const exists = await fm.currentFs.isFileExist(path);
  if (!exists) return;
  throw new Error(`File already exists: ${path}`);
};

const rewriteAndReopen = async (oldPath: string, newPath: string): Promise<void> => {
  const fs = api.core.useFileSystem();
  const bufferViewer = api.core.useBufferViewer();
  const buffers = api.core.useBuffers();
  const provider = api.core.useBufferProviders().get('file');

  const oldUri = buildBufferUri('file', oldPath);
  const newUri = buildBufferUri('file', newPath);

  const buffer = buffers.getBufferByUri(oldUri);

  if (!buffer || !provider?.write) {
    throw new Error('Buffer or file provider is not available');
  }

  await ensureDestinationAvailable(newPath);

  const content = new Uint8Array(buffer.rawContent);

  await provider.write(newPath, content);
  await buffers.closeBuffer(oldUri, true);
  await fs.deleteFile(oldPath);
  await bufferViewer.open(newUri);
};

const safeRewriteAndReopen = async (oldPath: string, newPath: string): Promise<void> => {
  const result = await to(rewriteAndReopen)(oldPath, newPath);
  if (result.isOk()) return;
  reporter.reportError(result.error);
};

export function getGlobalCommands(): Command[] {
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
      handler: (api) => {
        if (!sidebarStore.opened) {
          api.core.useCommands().execute(DefaultCommands.EDITOR_HIDE_KEYBOARD);
        }
        sidebarStore.toggle();
      },
    },
    {
      command: DefaultCommands.CLOSE_SIDEBAR,
      group: 'global',
      icon: 'arrow_circle_left',
      handler: () => {
        sidebarStore.close();
      },
    },
    {
      command: DefaultCommands.OPEN_SIDEBAR,
      group: 'global',
      icon: 'menu',
      handler: (api) => {
        api.core.useCommands().execute(DefaultCommands.EDITOR_HIDE_KEYBOARD);
        if (!sidebarStore.component) {
          api.core.useCommands().execute(DefaultCommands.TOGGLE_FILE_MANAGER);
          return;
        }
        sidebarStore.open();
      },
    },
    {
      command: DefaultCommands.PROJECT_INFO,
      icon: 'o_info',
      group: 'global',
      handler: (api) => {
        api.core.useBufferViewer().open('remote:///docs/info.org');
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
      disabled: isEncryptCommandDisabled,
      group: 'global',
      handler: async () => {
        const path = getActiveFilePath();
        if (!path || isOrgGpgFile(path)) return;
        const encryptedPath = `${path}.gpg`;
        await safeRewriteAndReopen(path, encryptedPath);
      },
    },
    {
      command: DefaultCommands.DECRYPT_NOTE,
      icon: 'sym_o_remove_moderator',
      description: I18N.DECRYPT_ACTIVE_NOTE,
      disabled: isDecryptCommandDisabled,
      group: 'global',
      handler: async () => {
        const path = getActiveFilePath();
        if (!path || !isOrgGpgFile(path)) return;
        const decryptedPath = path.replace(/\.gpg$/, '');
        await safeRewriteAndReopen(path, decryptedPath);
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
