import { useMeta } from 'quasar';
import { onBeforeUnmount } from 'vue';
import { description, productName } from '../../package.json';
import { MetaOptions } from 'quasar/dist/types/meta.js';

export function useAppMeta(options?: MetaOptions | (() => MetaOptions)) {
  const setMeta = (options: MetaOptions | (() => MetaOptions)) => {
    useMeta(options);
  };

  const defaultMetaOptions: MetaOptions = {
    title: productName,
    meta: {
      description: {
        name: 'description',
        content: description,
      },
      keywords: {
        name: 'keywords',
        content: undefined,
      },
      ogTitle: {
        property: 'og:title',
        content: undefined,
      },
    },
  };

  const useDefaultMeta = () => useMeta(defaultMetaOptions);

  setMeta(options ?? defaultMetaOptions);

  onBeforeUnmount(() => {
    useDefaultMeta();
  });

  return {
    setMeta,
    useDefaultMeta,
  };
}
