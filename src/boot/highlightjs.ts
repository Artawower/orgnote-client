import { boot } from 'quasar/wrappers';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import hljsCommon from 'highlight.js/lib/common';

export default boot(({ app }) => {
  // NOTE: https://github.com/highlightjs/vue-plugin/issues/44#issuecomment-1594686145
  hljsCommon.highlightAuto(
    '<h1>Highlight.js has been registered successfully!</h1>'
  ).value;
  app.use(hljsVuePlugin);
});
