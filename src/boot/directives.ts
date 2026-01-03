import { defineBoot } from '@quasar/app-vite/wrappers';
import { vHtmlSafe } from 'src/directives';

export default defineBoot(({ app }) => {
  app.directive('html-safe', vHtmlSafe);
});
