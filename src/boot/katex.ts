import { boot } from 'quasar/wrappers';
import Vue3Katex from '@hsorby/vue3-katex';

export default boot(({ app }) => {
  app.use(Vue3Katex);
});
