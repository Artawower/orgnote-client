import { useConfirmationModalStore } from './confirmation-modal';
import { useCurrentNoteStore } from './current-note';
import { useSettingsStore } from './settings';
import { OrgNoteApi, ThemeVariable } from 'src/api';
import { sdk } from 'src/boot/axios';
import { RouteNames } from 'src/router/routes';
import {
  applyCSSVariables,
  getCssTheme,
  mockServer,
  resetCSSVariables,
} from 'src/tools';
import { Router, useRouter } from 'vue-router';
import { useEditorStore } from './editor.store';
import { useCommandsStore } from './commands';
import { useSystemInfoStore } from './system-info';
import { useModalStore } from './modal';
import { Modal } from 'orgnote-api';
import { useFileSystem } from 'src/hooks/use-file-system';
import { useSyncStore } from './sync';
import { useFilesStore } from './files';
import { useFileOpenerStore } from './file-opener.store';
import { useFileManagerStore } from './file-manager';
import { useAuthStore } from './auth';

// TODO: move to the bootstrap hook
export const useOrgNoteApiStore = () => {
  const router = useRouter();

  const settings = useSettingsStore();
  const interaction = useInteraction();
  const { createWidgetBuilder, addWidgets, addExtensions, removeExtensions } =
    useEditorStore();

  const commandsStore = useCommandsStore();

  const orgNoteApi: OrgNoteApi = {
    navigation: useNavigation(router),
    currentNote: useCurrentNote(),
    ui: useUI(settings),
    interaction,
    system: useSystem(interaction),
    commands: {
      add: commandsStore.register,
      remove: commandsStore.unregister,
      get: commandsStore.getCommand,
      addCommandToSidebar: () =>
        console.error('Add command to sidebar is Unimplemented'),
      removeCommandFromSidebar: () =>
        console.error('Remove command from sidebar is Unimplemented'),
      addCommandToEditorPanel: () =>
        console.error('Add command to editor panel is Unimplemented'),
      removeCommandFromEditorPanel: () =>
        console.error('Remove command from editor panel is Unimplemented'),
      getAll: () => commandsStore.commands,
    },
    editor: {
      extensions: {
        add: addExtensions,
        remove: removeExtensions,
      },
      widgets: {
        createWidgetBuilder,
        add: addWidgets,
      },
    },
    core: {
      useFileSystem,
      useSyncStore,
      useFilesStore,
      useFileOpenerStore,
      useFileManagerStore,
      useAuthStore,
    },
    configuration: () => settings.config,
    sdk: sdk,
  };

  return {
    orgNoteApi,
  };
};

const useNavigation = (router: Router) => {
  const openNote = (id: string) =>
    router.push({ name: RouteNames.NoteDetail, params: { id } });
  const editNote = (id: string) =>
    router.push({ name: RouteNames.EditNote, params: { id } });

  return {
    openNote,
    editNote,
  };
};

const useCurrentNote = (): OrgNoteApi['currentNote'] => {
  const currentNoteStore = useCurrentNoteStore();
  return {
    get: () => currentNoteStore.currentNote,
  };
};

const useInteraction = (): OrgNoteApi['interaction'] => {
  const confirmationModalStore = useConfirmationModalStore();
  return {
    confirm: confirmationModalStore.confirm,
  };
};

const useUI = (
  settingsStore: ReturnType<typeof useSettingsStore>
): OrgNoteApi['ui'] => {
  const initialTheme = getCssTheme(Object.keys(ThemeVariable));

  const removeStyles = (scopeName: string) => {
    const styleEl = document.getElementById(scopeName);
    styleEl?.remove();
  };

  const modalStore = useModalStore();

  return {
    applyTheme: (theme) => applyCSSVariables(theme),
    setThemeByMode: async (themeName?: string) =>
      settingsStore.setTheme(themeName),
    setDarkTheme: async (themeName?: string) =>
      settingsStore.setDarkTheme(themeName),
    setLightTheme: async (themeName?: string) =>
      settingsStore.setLightTheme(themeName),
    applyCssVariables: (styles) => applyCSSVariables(styles),
    resetTheme: () => resetCSSVariables(initialTheme),
    applyStyles: (scopeName, styles) => {
      removeStyles(scopeName);
      const headerStyleEl = document.createElement('style');
      headerStyleEl.setAttribute('id', scopeName);
      headerStyleEl.innerHTML = styles;
      document.head.appendChild(headerStyleEl);
    },
    removeStyles,
    openModal: (modal: Modal) => modalStore.open(modal.component, modal.config),
  };
};

const useSystem = (
  interaction: OrgNoteApi['interaction']
): OrgNoteApi['system'] => {
  const systemInfoStore = useSystemInfoStore();
  return {
    reload: mockServer(async (params?: { verbose: boolean }): Promise<void> => {
      if (!params?.verbose) {
        window.location.reload();
        return;
      }
      const reload = await interaction.confirm(
        'Reload required',
        'This action require app reload. Are you sure?'
      );
      if (reload) {
        window.location.reload();
      }
    }),
    setNewFilesAvailable: (status?: boolean) => {
      if (!status) {
        return;
      }
      systemInfoStore.newFilesAvailable = status;
    },
  };
};
