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

export const useExtensionsStore = defineStore('extensionStore', () => {
  const extensions = ref<ExtensionMeta[]>([]);
  const activeExtensions = ref<ActiveExtension[]>([]);
  const extensionsLoaded = ref<boolean>(false);
  const searchQuery = ref<string>('');
  const apiStore = useOrgNoteApiStore();

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
        module.onMounted(apiStore.orgNoteApi);
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
    const ext = activeExtensions.value.find(
      (e) => e.manifest.name === extensionName
    );
    console.log('✎: [line 37][extensions.ts] ext: ', ext);
    ext.module?.onUnmounted?.(apiStore.orgNoteApi);

    if (ext.manifest.category === 'theme') {
      apiStore.orgNoteApi.ui.resetTheme();
    }

    activeExtensions.value = activeExtensions.value.filter(
      (ext) => ext.manifest.name !== extensionName
    );
    await setExtensionActiveStatus(extensionName, false);
    // Unload resources
  };

  const enableExtension = async (extensionName: string) => {
    const ext = await repositories.extensions.getExtension(extensionName);
    const module = await importExtension(ext.module);
    console.log('✎: [line 47][extensions.ts] module: ', module);
    module.onMounted(apiStore.orgNoteApi);
    activeExtensions.value.push({
      active: true,
      manifest: ext.manifest,
      module,
    });
    await setExtensionActiveStatus(extensionName, true);
    // Load resources
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

  return {
    extensions,
    activeExtensions,
    loadExtensions,
    disableExtension,
    enableExtension,
    extensionsLoaded,
    loadActiveExtensions,
    uploadExtension,

    filteredExtensions,
    searchQuery,
  };
});
