import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { createFileSystemBufferProvider } from 'src/infrastructure/buffer-providers/file-system-buffer-provider';

export default defineBoot(() => {
  const providerStore = api.core.useBufferProviders();

  providerStore.register(createFileSystemBufferProvider());
});
