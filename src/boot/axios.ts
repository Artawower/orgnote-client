import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import {
  AuthApiFactory,
  NotesApiFactory,
  SystemInfoApiFactory,
  TagsApiFactory,
} from 'src/generated/api';
import { initFilesApi } from 'src/patches/file-upload-patch';
import { useAuthStore } from 'src/stores/auth';

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
const axiosInstance = axios.create({
  baseURL: `${process.env.API_URL || '/v1'}`,
  timeout: +process.env.REQUEST_TIMEOUT || 15000,
});
axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    config.headers.Authorization = `Bearer ${authStore.token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const auth = AuthApiFactory(null, '', axiosInstance);
const notes = NotesApiFactory(null, '', axiosInstance);
const tags = TagsApiFactory(null, '', axiosInstance);
const system = SystemInfoApiFactory(null, '', axiosInstance);
const files = initFilesApi(axiosInstance);

const sdk = {
  auth,
  notes,
  tags,
  files,
  system,
} as const;

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = axiosInstance;
  app.config.globalProperties.$sdk = sdk;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axiosInstance, sdk };
