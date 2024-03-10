import {
  ExtensionMeta,
  Command,
  CommandHandlerParams,
  OrgNoteApi,
} from 'src/api';
import {
  useAuthStore,
  useCommandsStore,
  useCompletionStore,
  useCurrentNoteStore,
  useExtensionsStore,
  useFileManagerStore,
  useModalStore,
  useNoteEditorStore,
  useOrgNoteApiStore,
  useSearchStore,
  useSidebarStore,
} from 'src/stores';
import { useSettingsStore } from 'src/stores/settings';
import { camelCaseToWords, searchFilter } from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

import DebugPage from 'src/pages/DebugPage.vue';
import LoggerPage from 'src/pages/LoggerPage.vue';
import FileManagerSideBar from 'src/components/containers/FileManagerSideBar.vue';
import { RouteNames } from 'src/router/routes';
import SettingsPage from 'src/pages/SettingsPage.vue';
import ProjectInfo from 'src/pages/ProjectInfo.vue';

export enum COMMAND {
  openSearch = 'search',
  restoreLastCompletionSession = 'restore last completion',
  toggleExecuteCommand = 'toggle commands',
  reportBug = 'report bug',
  openDebugInfo = 'open debug info',
  showLogs = 'show logs',
}
export function useMainCommands() {
  const completionStore = useCompletionStore();
  const searchStore = useSearchStore();
  const commandsStore = useCommandsStore();

  const routesCommands = getRoutesCommands();
  const extensionStore = useExtensionsStore();
  const defaultCommands = useDefaultCommands();

  const { orgNoteApi } = useOrgNoteApiStore();

  const settingsCommands = getSettingsCommands(
    completionStore,
    extensionStore,
    orgNoteApi
  );
  const modalStore = useModalStore();

  const keybindingCommands: Command[] = [
    {
      command: COMMAND.toggleExecuteCommand,
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      icon: 'terminal',
      group: 'completion',
      allowOnInput: true,
      handler: (params?: CommandHandlerParams) => {
        completionStore.toggleCompletion();
        commandsStore.initCompletion();
        params?.event?.preventDefault();
      },
    },
    {
      command: COMMAND.reportBug,
      description: 'report bug',
      group: 'debug',
      handler: () =>
        window.open(
          'https://github.com/Artawower/orgnote-client/issues/new/choose',
          '_blank'
        ),
    },
    {
      command: COMMAND.openSearch,
      keySequence: '/',
      description: 'search notes',
      icon: 'search',
      group: 'search',
      handler: (params) => {
        searchStore.initCompletion();
        params.event?.preventDefault();
      },
    },
    {
      command: COMMAND.restoreLastCompletionSession,
      keySequence: "'",
      description: 'restore last completion session',
      group: 'search',
      handler: () => {
        completionStore.restoreLastCompletionSession();
      },
    },
    {
      command: COMMAND.openDebugInfo,
      keySequence: 'Ctrl+KeyD',
      description: 'open debug info',
      group: 'debug',
      handler: () => {
        modalStore.open(DebugPage, { title: 'system info' });
      },
    },
    {
      command: COMMAND.showLogs,
      keySequence: 'Ctrl+KeyD',
      description: 'show logs',
      group: 'debug',
      handler: () => {
        modalStore.open(LoggerPage, { title: 'logs' });
      },
    },
  ];

  const dynamicKeybindings: Command[] = [
    {
      handler: () => {
        completionStore.closeCompletion();
      },
      command: 'exit command executor',
      keySequence: 'Escape',
      description: 'Exit command executor',
      group: 'completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.nextCandidate();
      },
      command: 'next candidate',
      ignorePrompt: true,
      keySequence: 'Control+KeyJ',
      description: 'Next candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.previousCandidate();
      },
      command: 'previous candidate',
      ignorePrompt: true,
      keySequence: 'Control+KeyK',
      description: 'Previous candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      command: 'execute candidate',
      keySequence: 'Enter',
      description: 'Execute candidate',
      group: 'completion',
      allowOnInput: true,
      ignorePrompt: true,
      handler: () => {
        if (!completionStore.opened) {
          return;
        }
        completionStore.executeCandidate(completionStore.selectedCandidate);
      },
    },
  ];

  const register = () => {
    commandsStore.register(
      ...routesCommands,
      ...settingsCommands,
      ...keybindingCommands,
      ...dynamicKeybindings,
      ...defaultCommands
    );
  };

  return {
    register,
  };
}

function getRoutesCommands(): Command[] {
  const router = useRouter();
  const authStore = useAuthStore();
  const routesCommands: Command[] = router
    .getRoutes()
    // TODO: master tmp hack for avoid routes with params. Adapt to user input.
    .filter(
      (r) =>
        r.name &&
        !r.path.includes(':') &&
        r?.meta?.programmaticalNavigation !== false
    )
    .map((r) => ({
      command: camelCaseToWords(r.name.toString()).toLocaleLowerCase(),
      title: camelCaseToWords(r.name.toString()),
      description: `Open ${r.name.toString()}`,
      group: 'navigation',
      icon: (r.meta?.icon as string) ?? 'assistant_navigation',
      handler: () => router.push({ name: r.name }),
    }));

  const noteStore = useCurrentNoteStore();
  const route = useRoute();

  routesCommands.push(
    {
      command: 'graph',
      title: 'Graph',
      description: 'Open Graph',
      group: 'navigation',
      icon: 'hub',
      handler: () =>
        router.push({
          name: RouteNames.UserGraph,
          params: { userId: authStore.user.id },
        }),
    },
    {
      command: 'my notes',
      title: 'My Notes',
      description: 'Open My Notes',
      group: 'navigation',
      icon: 'home',
      handler: () =>
        router.push({
          name: RouteNames.UserNotes,
          params: { userId: authStore.user.id },
        }),
    },
    {
      command: 'edit mode',
      group: 'editor',
      icon: 'edit',
      description: 'edit current note',
      available: () => {
        const isNoteDetailPage = route.name == RouteNames.NoteDetail;

        return isNoteDetailPage && noteStore.currentNote?.isMy;
      },
      handler: () =>
        router.push({
          name: RouteNames.RawEditor,
          params: { id: noteStore.currentNote?.id },
        }),
    },
    {
      command: 'view mode',
      description: 'view current note',
      icon: 'visibility',
      available: () => {
        const isNoteEditPage = [
          RouteNames.EditNote,
          RouteNames.RawEditor,
        ].includes(route.name as RouteNames);
        return isNoteEditPage;
      },
      handler: () => {
        router.push({
          name: RouteNames.NoteDetail,
          params: { id: noteStore.currentNote?.id },
        });
      },
    }
  );
  return routesCommands;
}

// TODO: master right now this works only for boolean settings
function getSettingsCommands(
  completionStore: ReturnType<typeof useCompletionStore>,
  extensionStore: ReturnType<typeof useExtensionsStore>,
  orgNoteApi: OrgNoteApi
): Command[] {
  const settingsStore = useSettingsStore();
  const generatedCommands = getNestedConfigCommands(settingsStore.config);
  const noteEditorStore = useNoteEditorStore();

  const route = useRoute();

  return [
    ...generatedCommands,
    {
      command: 'select theme',
      group: 'settings',
      icon: 'palette',
      description: 'use one of the downloaded themes',
      handler: () => {
        completionStore.initNewCompletion<ExtensionMeta>({
          placeholder: 'search themes',
          itemsGetter: (filter: string) => ({
            result: extensionStore.themes
              .filter(
                (t) =>
                  t.uploaded &&
                  searchFilter(
                    filter,
                    t.manifest.name,
                    t.manifest.description,
                    t.manifest.category
                  )
              )
              .map((t) => ({
                icon: 'palette',
                title: t.manifest.name,
                description: t.manifest.description,
                commandHandler: () => {
                  orgNoteApi.ui.resetTheme();
                  extensionStore.enableExtension(t.manifest.name);
                },
                data: t,
                command: 'activate theme',
              })),
            total: extensionStore.themes.length,
          }),
        });
        completionStore.openCompletion();
      },
    },
    {
      command: 'reset theme',
      group: 'settings',
      icon: 'palette',
      handler: () => orgNoteApi.ui.resetTheme(),
    },
    {
      command: 'toggle dark mode',
      group: 'settings',
      icon: 'dark_mode',
      title: () =>
        settingsStore.darkMode
          ? 'switch to light theme'
          : 'switch to dark theme',
      handler: () => {
        settingsStore.setDarkMode(!settingsStore.darkMode);
      },
    },
    {
      command: 'toggle debug',
      group: 'editor',
      icon: 'bug_report',
      handler: () => noteEditorStore.toggleDebug(),
      available: () => {
        const isNoteEditPage = [
          RouteNames.EditNote,
          RouteNames.RawEditor,
        ].includes(route.name as RouteNames);

        return isNoteEditPage && settingsStore.config.common.developerMode;
      },
    },
  ];
}

function getNestedConfigCommands(
  config: Record<string, unknown>,
  path = ''
): Command[] {
  return Object.keys(config).reduce<Command[]>((acc, key) => {
    const value = config[key];
    if (typeof value === 'boolean') {
      acc.push({
        command: `${path}: ${camelCaseToWords(key)}`,
        description: `Toggle ${key}`,
        group: 'settings',
        icon: 'settings',
        handler: () => {
          config[key] = !config[key];
        },
      });
    } else if (value && typeof value === 'object') {
      acc.push(
        ...getNestedConfigCommands(value as Record<string, unknown>, key)
      );
    }
    return acc;
  }, []);
}

function useDefaultCommands(): Command[] {
  const sidebarStore = useSidebarStore();
  const fileManagerStore = useFileManagerStore();
  const modalStore = useModalStore();

  return [
    {
      command: 'toggle sidebar',
      group: 'global',
      icon: () => {
        return sidebarStore.opened ? 'arrow_circle_left' : 'menu';
      },
      description: 'toggle sidebar',
      handler: () => {
        sidebarStore.toggle();
      },
    },
    {
      command: 'toggle file manager',
      group: 'global',
      icon: 'folder',
      description: 'toggle file manager',
      handler: () => {
        sidebarStore.toggleWithComponent(FileManagerSideBar);
      },
    },
    {
      command: 'create note',
      icon: 'o_add_box',
      handler: () => fileManagerStore.createFile(),
    },
    {
      command: 'settings',
      icon: 'settings',
      description: 'open settings',
      handler: () => modalStore.open(SettingsPage, { title: 'settings' }),
    },
    {
      command: 'project info',
      icon: 'o_info',
      description: 'show project info',
      handler: () => modalStore.open(ProjectInfo),
    },
  ];
}
