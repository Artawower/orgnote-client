import { useOrgNoteApiStore } from './orgnote-api.store';
import { defineStore } from 'pinia';
import { ActiveExtension, ExtensionMeta, StoredExtension } from 'src/api';
import { BUILTIN_EXTENSIONS } from 'src/components/extensions';
import { compileExtension } from 'src/tools';

import { computed, ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const useExtensionsStore = defineStore('extension', () => {
  const extensions = ref<ExtensionMeta[]>([]);
  const activeExtensions = ref<ActiveExtension[]>([
    ...Object.values(BUILTIN_EXTENSIONS),
  ]);
  const activeExtensionsLoaded = ref<boolean>(false);
  const extensionsLoaded = ref<boolean>(false);
  const searchQuery = ref<string>('');
  const { orgNoteApi } = useOrgNoteApiStore();

  const loadExtensions = async () => {
    extensionsLoaded.value = false;
    extensions.value = await repositories.extensions.getMeta();
    extensionsLoaded.value = true;
  };

  const loadActiveExtensions = async () => {
    const storedExtensions =
      await repositories.extensions.getActiveExtensions();

    activeExtensions.value = await Promise.all(
      storedExtensions.map(async (ext) => await mountExtension(ext))
    );
    activeExtensionsLoaded.value = true;
  };

  const mountExtension = async (
    ext: StoredExtension
  ): Promise<ActiveExtension> => {
    const module = await getExtensionModule(ext);
    try {
      module.onMounted(orgNoteApi);
      return {
        active: true,
        manifest: ext.manifest,
        module,
      };
    } catch {
      console.error('✎: [line 42][extensions.ts] ext: ', ext);
      return;
    }
  };

  const getExtensionModule = async (ext: StoredExtension) => {
    if (ext.manifest.sourceType === 'builtin') {
      return BUILTIN_EXTENSIONS[ext.manifest.name].module;
    }
    return await compileExtension(ext.module);
  };

  const deleteExtension = async (ext: ExtensionMeta) => {
    await disableExtension(ext.manifest.name);
    await repositories.extensions.delete(ext.manifest.name);
    extensions.value = extensions.value.map((e) => {
      if (e.manifest.name !== ext.manifest.name) {
        return e;
      }
      return { ...e, uploaded: false };
    });
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
    if (!ext) {
      return;
    }
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
    await importExtension(ext);
    return ext;
  };

  const importExtension = async (ext: StoredExtension): Promise<void> => {
    const module = await getExtensionModule(ext);
    module.onMounted(orgNoteApi);
    activeExtensions.value.push({
      active: true,
      uploaded: true,
      ...ext,
      module,
    });
    await setExtensionActiveStatus(ext.manifest.name, true);
  };

  const enableThemeMaybe = (ext: ExtensionMeta): void => {
    if (ext.manifest.category !== 'theme') {
      return;
    }
    const previousTheme = activeExtensions.value.find(
      (e) =>
        e.manifest.name !== ext.manifest.name && e.manifest.category === 'theme'
    );
    previousTheme && deactivateExtension(previousTheme.manifest.name);
    orgNoteApi.ui.setThemeByMode(ext.manifest.name);
  };

  const uploadExtension = async (ext: StoredExtension) => {
    extensions.value = extensions.value.filter(
      (e) => e.manifest.name !== ext.manifest.name
    );
    extensions.value.push(ext);
    await repositories.extensions.upsertExtensions([ext]);
    if (ext.module || ext.manifest.sourceType === 'builtin') {
      await importExtension(ext);
    }
  };

  const setExtensionActiveStatus = async (
    extensionName: string,
    status: boolean
  ) => {
    await repositories.extensions.setActiveStatus(extensionName, status);
    extensions.value = extensions.value.map((ext) => {
      if (ext.manifest.name === extensionName) {
        ext.active = status;
        ext.uploaded = true;
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

  const isExtensionExist = (extensionName: string): boolean => {
    return !!extensions.value.find((e) => e.manifest.name === extensionName);
  };

  const initBuiltInExtensions = async () => {
    Object.keys(BUILTIN_EXTENSIONS).forEach(async (extName) => {
      const builtInExt = BUILTIN_EXTENSIONS[extName];
      if (!builtInExt.active) {
        return;
      }
      const alreadyLoaded = extensions.value.find(
        (e) => e.manifest.name === extName
      );
      if (alreadyLoaded) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { module, ...extMeta } = builtInExt;
      await uploadExtension(extMeta);
    });
  };

  return {
    extensions,
    activeExtensions,
    loadExtensions,
    activateExtension,
    deactivateExtension,
    disableExtension,
    enableExtension,
    activeExtensionsLoaded,
    extensionsLoaded,
    loadActiveExtensions,
    deactivateThemeExtension,
    uploadExtension,
    deleteExtension,
    isExtensionExist,
    initBuiltInExtensions,

    filteredExtensions,
    searchQuery,
    themes,
  };
});
