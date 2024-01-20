import { useExtensionsStore } from './extensions';
import fetchMixin from '@es-git/fetch-mixin';
import loadAsMixin from '@es-git/load-as-mixin';
import MemoryRepo from '@es-git/memory-repo';
import mix from '@es-git/mix';
import object from '@es-git/object-mixin';
import walkers from '@es-git/walkers-mixin';
// import FS from '@isomorphic-git/lightning-fs';
// import { readdir } from 'fs';
// import { clone } from 'isomorphic-git';
// import http from 'isomorphic-git/http/web';
import { defineStore } from 'pinia';
import { useNotifications } from 'src/hooks';
import { repositories } from 'src/repositories';
import { readExtensionFromString } from 'src/tools';

import { ref } from 'vue';

export const usePackageManagerStore = defineStore(
  'package-manager',
  () => {
    const sources = ref<Set<string>>();
    const notifications = useNotifications();

    const addSource = async (source: string) => {
      const normalizedSource = source;
      sources.value?.add(normalizedSource);
      await loadSource(normalizedSource);
    };

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
      // TODO: iterate over all source al pull content!
    };

    // const fs = new FS('extensions');
    // const sourceNameRegexp = /https:\/\/.+\/(.+\/.+)/;
    // const sourceNameRegexp = /git.+:(.+\/.+)/;
    const loadSource = async (source: string) => {
      const sourceErrors = validatePackageSource(source);
      if (sourceErrors) {
        notifications.error(sourceErrors);
        return;
      }
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

      const Repo = mix(MemoryRepo)
        .with(object)
        .with(walkers)
        .with(loadAsMixin)
        .with(fetchMixin, fetch);

      const repo = new Repo();
      const url = 'https://corsproxy.io/?' + encodeURIComponent(source);
      const result = await repo.fetch(url, 'refs/heads/*:refs/heads/*', {
        progress: (message) => console.log(message),
      });
      const hash = result[0].hash;

      const { tree: treeHash } = await repo.loadCommit(hash);

      const t = await repo.loadTree(treeHash);
      if (!t['index.js']?.hash) {
        notifications.error('incorrect extension, no index.js file');
        return;
      }

      const text = await repo.loadText(t['index.js'].hash);
      const ext = await readExtensionFromString(text);
      await extensionStore.uploadExtension(ext);

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

      // const sourceCode = getExtensionSourceCode(fs, dir);
    };

    // const getExtensionSourceCode = async (fs: FS, dir: string) => {
    //   fs.readdir(dir, null, (files) => {
    //     console.log('✎: [line 74][package-manager.store.ts] files: ', files);
    //   });
    // };

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
