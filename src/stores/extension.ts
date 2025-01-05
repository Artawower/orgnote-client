import { defineStore } from 'pinia';
import type {
  ActiveExtension,
  Extension,
  ExtensionMeta,
  ExtensionStore,
  StoredExtension,
} from 'orgnote-api';
import { ref } from 'vue';
import { computed } from 'vue';
import { BUILTIN_EXTENSIONS } from 'src/extensions';
import { api } from 'src/boot/api';
import { compileExtension } from 'src/tools/read-extension';

export const useExtensionsStore = defineStore<'extension', ExtensionStore>('extension', () => {
  const extensions = ref<ExtensionMeta[]>([]);
  const activeExtensions = ref<ActiveExtension[]>([...Object.values(BUILTIN_EXTENSIONS)]);

  const loading = ref<number>(0);
  const ready = computed(() => loading.value <= 0);

  const sync = async () => {
    console.error('Implement sync with file system');
  };

  const init = async () => {
    await sync();
  };

  // TODO: feat/stable-beta implement after repositories
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const enableExtension = async (extensionName: string) => {
    // const ext = await repositories.extensions.getExtension(extensionName);
    // if (!ext) {
    //   console.warn(`Extension ${extensionName} not found`);
    //   return;
    // }
    // await mountExtension(ext);
    // return ext;
  };

  // TODO: feat/stable-beta save mount extension
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mountExtension = async (ext: StoredExtension): Promise<ActiveExtension | undefined> => {
    const module = await getExtension(ext);
    try {
      module.onMounted(api);
      await setExtensionActiveStatus(ext.manifest.name, true);

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

  const getExtension = async (ext: StoredExtension): Promise<Extension> => {
    if (ext.manifest.sourceType === 'builtin') {
      return BUILTIN_EXTENSIONS[ext.manifest.name]!.module;
    }
    return await compileExtension(ext.module!);
  };

  // TODO: feat/stable-beta implement after repositories imple
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setExtensionActiveStatus = async (extensionName: string, status: boolean) => {
    // await repositories.extensions.setActiveStatus(extensionName, status);
    // extensions.value = extensions.value.map((ext) => {
    //   if (ext.manifest.name === extensionName) {
    //     ext.active = status;
    //     ext.uploaded = true;
    //   }
    //   return ext;
    // });
  };

  const disableExtension = async (extensionName: string) => {
    const ext = await deactivateExtension(extensionName);
    if (!ext) {
      console.warn(`Extension ${extensionName} not found`);
      return;
    }
    // TODO: feat/stable-beta UI hook for disable theme.
  };

  const deactivateExtension = async (extensionName: string): Promise<ExtensionMeta | undefined> => {
    const ext = activeExtensions.value.find((e) => e.manifest.name === extensionName);
    if (!ext) {
      return;
    }
    ext.module?.onUnmounted?.(api);
    activeExtensions.value = activeExtensions.value.filter(
      (ext) => ext.manifest.name !== extensionName,
    );
    await setExtensionActiveStatus(extensionName, false);
    return ext;
  };

  const isExtensionExist = (extensionName: string): boolean => {
    return !!extensions.value.find((e) => e.manifest.name === extensionName);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addExtension = async (ext: StoredExtension) => {
    // extensions.value = extensions.value.filter((e) => e.manifest.name !== ext.manifest.name);
    // extensions.value.push(ext);
    // await repositories.extensions.upsertExtensions([ext]);
    // if (ext.module || ext.manifest.sourceType === 'builtin') {
    //   await mountExtension(ext);
    // }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteExtension = async (ext: ExtensionMeta) => {
    // await disableExtension(ext.manifest.name);
    // await repositories.extensions.delete(ext.manifest.name);
    // extensions.value = extensions.value.map((e) => {
    //   if (e.manifest.name !== ext.manifest.name) {
    //     return e;
    //   }
    //   return { ...e, uploaded: false };
    // });
  };

  const enableSafeMode = async () => {};

  const disableSafeMode = async () => {};

  return {
    extensions,
    ready,

    sync,
    init,
    enableExtension,
    disableExtension,
    isExtensionExist,
    addExtension,
    deleteExtension,
    enableSafeMode,
    disableSafeMode,
  };
});
