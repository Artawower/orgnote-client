import { defineAsyncComponent } from 'vue';

export const FileManagerRef = defineAsyncComponent(() => import('./FileManager.vue'));
