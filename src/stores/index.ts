import { store } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
export * from './notes';
export * from './completion';
export * from './note-editor';
export * from './search';

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
