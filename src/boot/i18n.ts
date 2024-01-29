import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import { useSettingsStore } from 'src/stores/settings';

export default boot(({ app }) => {
  const settingsStore = useSettingsStore();

  const i18n = createI18n({
    locale: settingsStore.locale,
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
});
