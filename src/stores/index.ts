import { defineStore } from '@quasar/app-vite/wrappers';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import type { OrgNoteApi } from 'orgnote-api';
import { createPinia } from 'pinia';

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // add your custom properties here, if any
    readonly api: OrgNoteApi;
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();

  // You can add Pinia plugins here
  // pinia.use(SomePiniaPlugin)
  pinia.use(piniaPluginPersistedstate);
  return pinia;
});
