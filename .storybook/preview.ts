import type { Preview } from '@storybook/vue3';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/animate/fadeInUp.css';
import '@quasar/extras/animate/fadeOutDown.css';
import '@quasar/extras/animate/fadeInRight.css';
import '@quasar/extras/animate/fadeOutRight.css';

import 'quasar/dist/quasar.css';
import { setup } from '@storybook/vue3';
import { i18n } from '../src/boot/i18n';

import { QBtn, QIcon, Quasar } from 'quasar';
import { createPinia } from 'pinia';
import './global.css';

setup((app) => {
  app.use(Quasar, {
    components: {
      QIcon,
      QBtn,
      // etc. for whichever Quasar components you directly use
    },
  });
  app.use(i18n);
  app.use(createPinia());
});

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
