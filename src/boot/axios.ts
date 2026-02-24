import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { createAxiosInstance, createSdk, type Sdk } from 'src/infrastructure/api';
import { useAuthStore } from 'src/stores/auth';
import { useConfigStore } from 'src/stores/config';
import { getApiBaseUrl } from 'src/utils/server-endpoints';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
    $sdk: Sdk;
  }
}

let api: AxiosInstance;
let sdk: Sdk;

export default defineBoot(({ app, store }) => {
  const authStore = useAuthStore(store);
  const configStore = useConfigStore(store);

  api = createAxiosInstance(
    () => authStore.token,
    () => getApiBaseUrl(configStore.config.network.apiUrl),
  );
  sdk = createSdk(api);

  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$sdk = sdk;
});

export { api, sdk };
