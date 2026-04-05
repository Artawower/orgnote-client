import { api } from 'src/boot/api';
import { bootstrapRemoteConfig } from './bootstrap-remote-config';

export const runPostActivationSync = async (): Promise<void> => {
  await bootstrapRemoteConfig();
  await api.core.useSync().sync();
};
