import { useOrgNoteApiStore } from './orgnote-api.store';
import { defineStore } from 'pinia';
import {
  ActiveExtension,
  ExtensionMeta,
  StoredExtension,
} from 'src/api/extension';
import { repositories } from 'src/repositories';
import { importExtension } from 'src/tools';

import { computed, ref } from 'vue';

export const useExtensionsStore = defineStore('extension', () => {
  const extensions = ref<ExtensionMeta[]>([]);
  const activeExtensions = ref<ActiveExtension[]>([]);
  const extensionsLoaded = ref<boolean>(false);
  const searchQuery = ref<string>('');
  const { orgNoteApi } = useOrgNoteApiStore();

  const loadExtensions = async () => {
    extensions.value = await repositories.extensions.getMeta();
    /* Load extensions from server side */
  };

  const loadActiveExtensions = async () => {
    const storedExtensions =
      await repositories.extensions.getActiveExtensions();

    activeExtensions.value = await Promise.all(
      storedExtensions.map(async (ext) => {
        const module = await importExtension(ext.module);
        module.onMounted(orgNoteApi);
        return {
          active: true,
          manifest: ext.manifest,
          module,
        };
      })
    );
    extensionsLoaded.value = true;
  };

  const disableExtension = async (extensionName: string) => {
    const ext = await deactivateExtension(extensionName);
    if (!ext) {
      console.warn(`Extension ${extensionName} not found`);
      return;
    }
    disableThemeMaybe(ext);
  };

  const deactivateExtension = async (
    extensionName: string
  ): Promise<ExtensionMeta> => {
    const ext = activeExtensions.value.find(
      (e) => e.manifest.name === extensionName
    );
    ext.module?.onUnmounted?.(orgNoteApi);
    activeExtensions.value = activeExtensions.value.filter(
      (ext) => ext.manifest.name !== extensionName
    );
    await setExtensionActiveStatus(extensionName, false);
    return ext;
  };

  const disableThemeMaybe = (ext: ExtensionMeta): void => {
    if (ext.manifest.category !== 'theme') {
      return;
    }
    orgNoteApi.ui.resetTheme();
    orgNoteApi.ui.setThemeByMode(null);
  };

  const enableExtension = async (extensionName: string) => {
    const ext = await activateExtension(extensionName);
    if (!ext) {
      console.warn(`Extension ${extensionName} not found`);
      return;
    }
    enableThemeMaybe(ext);
  };

  /*
   * Just activate extensions without any side effects
   */
  const activateExtension = async (
    extensionName: string
  ): Promise<ExtensionMeta> => {
    const ext = await repositories.extensions.getExtension(extensionName);
    const module = await importExtension(ext.module);
    module.onMounted(orgNoteApi);
    activeExtensions.value.push({
      active: true,
      manifest: ext.manifest,
      module,
    });
    await setExtensionActiveStatus(extensionName, true);
    return ext;
  };

  const enableThemeMaybe = (ext: ExtensionMeta): void => {
    if (ext.manifest.category !== 'theme') {
      return;
    }
    orgNoteApi.ui.setThemeByMode(ext.manifest.name);
  };

  const uploadExtension = async (ext: StoredExtension) => {
    extensions.value = extensions.value.filter(
      (e) => e.manifest.name !== ext.manifest.name
    );

    extensions.value.push({
      active: false,
      manifest: ext.manifest,
    });
    await repositories.extensions.upsertExtensions([ext]);
  };

  const setExtensionActiveStatus = async (
    extensionName: string,
    status: boolean
  ) => {
    await repositories.extensions.setActiveStatus(extensionName, status);
    extensions.value = extensions.value.map((ext) => {
      if (ext.manifest.name === extensionName) {
        ext.active = status;
      }
      return ext;
    });
  };

  const filteredExtensions = computed(() => {
    if (!searchQuery.value) {
      return extensions.value;
    }
    return extensions.value.filter(
      ({ manifest }) =>
        manifest.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        manifest.description
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        manifest.author
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        manifest.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    );
  });

  const themes = computed(() => {
    return extensions.value.filter(
      ({ manifest }) => manifest.category === 'theme'
    );
  });

  const deactivateThemeExtension = async (): Promise<void> => {
    const themeExtension = activeExtensions.value.find(
      (t) => t.manifest.category === 'theme'
    );
    if (!themeExtension) {
      return;
    }
    orgNoteApi.ui.resetTheme();
    await deactivateExtension(themeExtension.manifest.name);
  };

  return {
    extensions,
    activeExtensions,
    loadExtensions,
    activateExtension,
    deactivateExtension,
    disableExtension,
    enableExtension,
    extensionsLoaded,
    loadActiveExtensions,
    deactivateThemeExtension,
    uploadExtension,

    filteredExtensions,
    searchQuery,
    themes,
  };
});
