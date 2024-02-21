import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { store } from 'quasar/wrappers';

export * from './notes';
export * from './completion';
export * from './note-editor';
export * from './search';
export * from './selected-notes';
export * from './auth';
export * from './sync';
export * from './current-note';
export * from './public-notes';
export * from './file';
export * from './toolbar';
export * from './sidebar';
export * from './file-manager';
export * from './note-creator';
export * from './modal';
export * from './org-babel';
export * from './commands';
export * from './orgnote-api.store';
export * from './logger';
export * from './recent-commands-store';
export * from './notes-statistic';
export * from './extensions';
export * from './editor-widget.store';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */
export default store((/* { ssrContext } */) => {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  return pinia;
});
