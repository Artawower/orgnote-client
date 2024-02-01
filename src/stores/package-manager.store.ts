import { useExtensionsStore } from './extensions';
// import FS from '@isomorphic-git/lightning-fs';
// import { readdir } from 'fs';
// import { clone } from 'isomorphic-git';
// import http from 'isomorphic-git/http/web';
import { defineStore } from 'pinia';
import { useNotifications } from 'src/hooks';
import {
  ExtensionNotFoundError,
  IncorrectExtensionError,
  readExtensionFromString,
  readFileFromRepo,
  refreshPackages,
} from 'src/tools';

import { ref } from 'vue';
import { useSettingsStore } from './settings';

export const usePackageManagerStore = defineStore(
  'package-manager',
  () => {
    const sources = ref<Set<string>>();
    const notifications = useNotifications();
    const extensionStore = useExtensionsStore();
    const loading = ref(false);
    const { config } = useSettingsStore();

    const autoRefreshTimer = 1200000; // 20 minutes
    // TODO: refactor/types return for production mode
    // const initialRefreshDelay = 60000; // 60 seconds
    console.log('REFRESH PACKAGE START');
    const initialRefreshDelay = 3000; // 5 sec
    const refreshSources = async () => {
      if (!config.extensions.sources) {
        return;
      }
      const packages = refreshPackages(config.extensions.sources);
      for await (const p of packages) {
        if (extensionStore.isExtensionExist(p.name)) {
          continue;
        }
        await extensionStore.uploadExtension({
          manifest: p,
          uploaded: null,
          module: null,
        });
      }
      console.log('REFRESH PACKAGE END');
    };

    setTimeout(refreshSources, initialRefreshDelay);
    setInterval(refreshSources, autoRefreshTimer);

    const addSource = async (source: string) => {
      const normalizedSource = source;
      sources.value?.add(normalizedSource);
      await loadSource(normalizedSource);
    };

    const removeSource = async (source: string) => {
      sources.value?.delete(source);
    };

    // const fs = new FS('extensions');
    // const sourceNameRegexp = /https:\/\/.+\/(.+\/.+)/;
    // const sourceNameRegexp = /git.+:(.+\/.+)/;
    // TODO: master add loading status for each extension
    const loadSource = async (source: string) => {
      const sourceErrors = validatePackageSource(source);
      if (sourceErrors) {
        notifications.error(sourceErrors);
        return;
      }
      loading.value = true;
      // TODO: feature/extensions validate
      // const normalizedDirName = sourceNameRegexp
      //   .exec(source)?.[1]
      //   ?.replace('/', '_')
      //   ?.replace('.', '_');

      // if (!normalizedDirName) {
      //   notifications.error(`Could not create dir: ${normalizedDirName}`);
      //   return;
      // }
      // const dir = `/${normalizedDirName}`;

      try {
        const text = await readFileFromRepo(source, [
          'index.js',
          'dist/index.js',
        ]);
        const ext = await readExtensionFromString(text);
        await extensionStore.uploadExtension(ext);
      } catch (e) {
        loading.value = false;
        if (e instanceof IncorrectExtensionError) {
          notifications.error('incorrect extension, no index.js file');
          return;
        }
        if (e instanceof ExtensionNotFoundError) {
          notifications.error('extension not found');
          return;
        }

        throw e;
      }

      // TODO: feature/extensions https://github.com/isomorphic-git/isomorphic-git/issues/1855
      // await clone({
      //   fs,
      //   http,
      //   dir,
      //   corsProxy: 'https://cors.isomorphic-git.org',
      //   url: source,
      //   singleBranch: true,
      //   depth: 1,
      // });

      loading.value = false;
    };

    const validatePackageSource = (source?: string): string => {
      if (!source?.startsWith('http')) {
        return 'Source must be git repository';
      }
    };

    return {
      sources,
      addSource,
      removeSource,
      refreshSources,
      loading,
    };
  },
  { persist: true }
);
