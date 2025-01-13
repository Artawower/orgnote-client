import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createMemoryHistory } from 'vue-router';
import { RouteNames } from 'orgnote-api';
import { provide, ref } from 'vue';
import { getNumericCssVar } from 'src/utils/css-utils';
import { SETTINGS_ROUTER_PROVIDER_TOKEN } from 'src/constants/app-providers';

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
        name: RouteNames.LanguageSettings,
        path: '/settings/language',
        component: () => import('./LanguageSettings.vue'),
      },
    ],
  });

  const screenWidth = ref(window.innerWidth);
  const isMobile = ref(screenWidth.value < 768);

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

  provide(SETTINGS_ROUTER_PROVIDER_TOKEN, router);
  return router;
}
