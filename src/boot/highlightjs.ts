import 'highlight.js/lib/common';

import { boot } from 'quasar/wrappers';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import 'highlight.js';

export default boot(({ app }) => {
  app.use(hljsVuePlugin);
});
