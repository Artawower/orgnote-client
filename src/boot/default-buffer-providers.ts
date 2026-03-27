import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { createFileSystemBufferProvider } from 'src/infrastructure/buffer-providers/file-system-buffer-provider';
import { createRemoteBufferProvider } from 'src/infrastructure/buffer-providers/remote-buffer-provider';
import { createEmbeddedBufferProvider } from 'src/infrastructure/buffer-providers/embedded-buffer-provider';
import { textToUint8Array } from 'orgnote-api/utils';

export default defineBoot(() => {
  const providerStore = api.core.useBufferProviders();

  providerStore.register(createFileSystemBufferProvider());
  providerStore.register(createRemoteBufferProvider());
  providerStore.register(createEmbeddedBufferProvider());
  providerStore.register({
    scheme: 'builtin',
    read: async () => textToUint8Array(''),
    getContext: (path: string) => ({ title: path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '' }),
  });
});
