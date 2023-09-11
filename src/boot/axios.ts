import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/auth';
import {
  AuthApiFactory,
  NotesApiFactory,
  TagsApiFactory,
} from 'src/generated/api';
import { initFilesApi } from 'src/patches/file-upload-patch';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: `${process.env.API_URL || '/v1'}` });
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    config.headers.Authorization = `Bearer ${authStore.token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const auth = AuthApiFactory(null, '', api);
const notes = NotesApiFactory(null, '', api);
const tags = TagsApiFactory(null, '', api);
const files = initFilesApi(api);

const sdk = {
  auth,
  notes,
  tags,
  files,
};

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  app.config.globalProperties.$sdk = sdk;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api, sdk };
