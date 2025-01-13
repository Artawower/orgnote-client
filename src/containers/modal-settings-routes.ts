import { createRouter, createMemoryHistory } from 'vue-router';
import { RouteNames } from 'orgnote-api';

export function createSettingsRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        redirect: { path: RouteNames.SystemSettings },
      },
      {
        name: RouteNames.SystemSettings,
        path: '/settings/system',
        component: () => import('./SystemSettings.vue'),
      },
      {
        name: RouteNames.LanguageSettings,
        path: '/settings/language',
        component: () => import('./LanguageSettings.vue'),
      },
    ],
  });
}
