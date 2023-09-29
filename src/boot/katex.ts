import Vue3Katex from '@hsorby/vue3-katex';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
  app.use(Vue3Katex, {
    globalOptions: {
      throwOnError: false,
    },
  });
});
