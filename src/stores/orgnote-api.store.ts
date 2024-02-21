import { useConfirmationModalStore } from './confirmation-modal';
import { useCurrentNoteStore } from './current-note';
import { useSettingsStore } from './settings';
import { OrgNoteApi, ThemeVariable } from 'src/api';
import { sdk } from 'src/boot/axios';
import { RouteNames } from 'src/router/routes';
import { applyCSSVariables, getCssTheme, resetCSSVariables } from 'src/tools';
import { Router, useRouter } from 'vue-router';
import { useEditorWidgetStore } from './editor-widget.store';

export const useOrgNoteApiStore = () => {
  const router = useRouter();

  const settings = useSettingsStore();
  const interaction = useInteraction();
  const { createWidgetBuilder, add } = useEditorWidgetStore();

  const orgNoteApi: OrgNoteApi = {
    navigation: useNavigation(router),
    currentNote: useCurrentNote(),
    ui: useUI(settings),
    interaction,
    system: useSystem(interaction),
    commands: {
      add: () => {
        console.error('Unimplemented');
      },
    },
    editor: {
      widgets: {
        createWidgetBuilder,
        add,
      },
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
  };
};

const useSystem = (
  interaction: OrgNoteApi['interaction']
): OrgNoteApi['system'] => {
  return {
    reload: async (params?: { verbose: boolean }): Promise<void> => {
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
    },
  };
};
