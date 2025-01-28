import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createMemoryHistory } from 'vue-router';
import { RouteNames } from 'orgnote-api';
import { ref } from 'vue';
import { getNumericCssVar } from 'src/utils/css-utils';

const redirectRoute: RouteRecordRaw = {
  path: '/',
  redirect: { name: RouteNames.SystemSettings },
  name: RouteNames.SettingsPage,
};

export function createSettingsRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      redirectRoute,
      {
        name: RouteNames.SystemSettings,
        path: '/settings/system',
        component: () => import('./SystemSettings.vue'),
      },
      {
        name: RouteNames.StorageSettings,
        path: '/settings/storage',
        component: () => import('./StorageSettings.vue'),
      },
      {
        name: RouteNames.LanguageSettings,
        path: '/settings/language',
        component: () => import('./LanguageSettings.vue'),
      },
      {
        name: RouteNames.InterfaceSettings,
        path: '/settings/interface',
        component: () => import('./InterfaceSettings.vue'),
      },
      {
        name: RouteNames.SynchronisationSettings,
        path: '/settings/synchronisation',
        component: () => import('./SynchronisationSettings.vue'),
      },
      {
        name: RouteNames.SubscriptionSettings,
        path: '/settings/subscription',
        component: () => import('./SubscriptionSettings.vue'),
      },
      {
        name: RouteNames.KeybindingSettings,
        path: '/settings/keybindings',
        component: () => import('./KeybindingSettings.vue'),
      },
      {
        name: RouteNames.EncryptionSettings,
        path: '/settings/encryption',
        component: () => import('./EncryptionSettings.vue'),
      },
      {
        name: RouteNames.DeveloperSettings,
        path: '/settings/developer',
        component: () => import('./DeveloperSettings.vue'),
      },
      {
        name: RouteNames.ExtensionsSettings,
        path: '/settings/extensions',
        component: () => import('./ExtensionsSettings.vue'),
      },
      {
        name: RouteNames.ApiSettings,
        path: '/settings/api',
        component: () => import('./ApiSettings.vue'),
      },
    ],
  });

  const screenWidth = ref(window.innerWidth);
  const isMobile = ref<boolean>(null);

  const updateRoutes = () => {
    router.removeRoute(RouteNames.SettingsPage);
    if (isMobile.value) {
      router.addRoute({
        path: '/',
        name: RouteNames.SettingsPage,
        component: () => import('./SettingsMenu.vue'),
      });
      return;
    }
    router.addRoute(redirectRoute);
  };

  const handleResize = () => {
    const maxMobileWidth = getNumericCssVar('--desktop');
    if (!maxMobileWidth) {
      return;
    }
    screenWidth.value = window.innerWidth;
    const mobile = screenWidth.value < maxMobileWidth;
    console.log('✎: [line 55][modal-settings-routes.ts] mobile: ', mobile, isMobile.value);
    if (mobile === isMobile.value) {
      return;
    }
    isMobile.value = mobile;
    updateRoutes();
    redirectActiveSettingsPage();
  };

  const redirectActiveSettingsPage = () => {
    if (router.currentRoute.value.name === RouteNames.SettingsPage) {
      router.push({ name: RouteNames.SystemSettings });
    }
  };

  window.addEventListener('resize', handleResize);

  handleResize();

  console.log('[line 73]: ', router.getRoutes());
  return router;
}
