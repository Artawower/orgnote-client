import { useExtensionsStore } from './extensions';
import FS from '@isomorphic-git/lightning-fs';
import { clone } from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { defineStore } from 'pinia';
import { useNotifications } from 'src/hooks';
import { repositories } from 'src/repositories';

import { ref } from 'vue';

export const usePackageManagerStore = defineStore(
  'package-manager',
  () => {
    const sources = ref<Set<string>>();
    const fs = new FS('extensions');
    const notifications = useNotifications();

    const addSource = async (source: string) => {
      // console.log('✎: [line 19][package-manager.store.ts] source: ', source);
      // const normalizedSource = normalizeSourceUrl(source);
      const normalizedSource = source;
      sources.value?.add(normalizedSource);
      await loadSource(normalizedSource);
    };

    // const normalizeSourceUrl = (url: string): string => {
    //   if (url.endsWith('.git')) {
    //     return url.slice(0, -4);
    //   }
    //   return url;
    // };

    const extensionStore = useExtensionsStore();

    const removeSource = async (source: string) => {
      sources.value?.delete(source);
      const ext = await repositories.extensions.getExtensionBySource(source);
      if (!ext) {
        return;
      }
      await extensionStore.deactivateExtension(ext.manifest.name);
      await repositories.extensions.deleteBySource(source);
    };

    const refreshSources = () => {
      // pass
    };

    const sourceNameRegexp = /https:\/\/.+\/(.+\/.+)/;
    // const sourceNameRegexp = /git.+:(.+\/.+)/;
    const loadSource = async (source: string) => {
      const sourceErrors = validatePackageSource(source);
      if (sourceErrors) {
        notifications.error(sourceErrors);
        return;
      }
      // TODO: feature/extensions validate
      const normalizedDirName = sourceNameRegexp
        .exec(source)?.[1]
        ?.replace('/', '_')
        ?.replace('.', '_');

      if (!normalizedDirName) {
        notifications.error(`Could not create dir: ${normalizedDirName}`);
        return;
      }
      const dir = `/${normalizedDirName}`;

      console.log(
        '✎: [line 51][package-manager.store.ts] source: ',
        source,
        dir
      );

      await clone({
        fs,
        http,
        dir,
        corsProxy: 'https://cors.isomorphic-git.org',
        url: source,
        singleBranch: true,
        depth: 1,
      });

      const sourceCode = getExtensionSourceCode(fs, dir);
    };

    const getExtensionSourceCode = async (fs: FS, dir: string) => {
      fs.readdir(dir, null, (files) => {
        console.log('✎: [line 74][package-manager.store.ts] files: ', files);
      });
    };

    const validatePackageSource = (source: string): string => {
      if (!source.startsWith('http')) {
        return 'Source must be git repository';
      }
    };

    return {
      sources,
      addSource,
      removeSource,
      refreshSources,
    };
  },
  { persist: true }
);
