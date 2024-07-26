import { Command, ExtensionMeta, DefaultCommands } from 'orgnote-api';
import { RouteNames } from 'src/router/routes';
import { useCompletionStore } from 'src/stores/completion';
import { useExtensionsStore } from 'src/stores/extensions';
import { useNoteEditorStore } from 'src/stores/note-editor';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { useSettingsStore } from 'src/stores/settings';
import { camelCaseToWords, searchFilter } from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

export function getSettingsCommands(): Command[] {
  const settingsStore = useSettingsStore();
  const generatedCommands = getNestedConfigCommands(settingsStore.config);
  const noteEditorStore = useNoteEditorStore();
  const completionStore = useCompletionStore();
  const extensionStore = useExtensionsStore();
  const { orgNoteApi } = useOrgNoteApiStore();
  const route = useRoute();
  const router = useRouter();

  return [
    ...generatedCommands,
    {
      // TODO: refactor this comand
      command: DefaultCommands.SELECT_THEME,
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
      command: DefaultCommands.RESET_THEME,
      group: 'settings',
      icon: 'palette',
      handler: () => orgNoteApi.ui.resetTheme(),
    },
    {
      command: DefaultCommands.TOGGLE_DARK_MODE,
      group: 'settings',
      icon: 'dark_mode',
      title: () =>
        settingsStore.darkMode
          ? 'switch to light theme'
          : 'switch to dark theme',
      handler: () => {
        settingsStore.config.ui.theme = settingsStore.darkMode
          ? 'light'
          : 'dark';
      },
    },
    {
      command: DefaultCommands.TOGGLE_DEBUG_MODE,
      group: 'editor',
      icon: 'bug_report',
      handler: () => noteEditorStore.toggleDebug(),
      available: () => {
        const isNoteEditPage = [
          RouteNames.EditNote,
          RouteNames.RawEditor,
        ].includes(route.name as RouteNames);

        return isNoteEditPage && settingsStore.config.developer.developerMode;
      },
    },
    {
      command: DefaultCommands.SETTINGS,
      icon: 'settings',
      group: 'global',
      description: 'open settings',
      handler: () => router.push({ name: RouteNames.SettingsPage }),
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
