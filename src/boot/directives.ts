import { defineBoot } from '@quasar/app-vite/wrappers';
import { vHtmlSafe, vClickMobile } from 'src/directives';

export default defineBoot(({ app }) => {
  app.directive('html-safe', vHtmlSafe);
  app.directive('click-mobile', vClickMobile);
});
