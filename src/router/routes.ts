import { RouteNames, RoutePaths } from 'orgnote-api';
import { api } from 'src/boot/api';
import type { RouteRecordRaw } from 'vue-router';

const isServer = (): boolean => !!process.env.SERVER;

const routes: RouteRecordRaw[] = [
  {
    path: '/error',
    name: RouteNames.Error,
    component: () => import('pages/ErrorPage.vue'),
    beforeEnter: () => {
      api.core.useNotifications().hideAll();
      return true;
    },
  },
  {
    path: '/onboarding',
    name: RouteNames.Onboarding,
    component: () => import('pages/OnboardingPage.vue'),
    beforeEnter: () => {
      if (isServer()) {
        return true;
      }
      const fileManager = api.core.useFileSystemManager();
      const available = fileManager.currentFsName;
      if (available) {
        return { name: RouteNames.Home };
      }
      return true;
    },
  },
  {
    path: `/${RoutePaths.AUTH_LOGIN}/:initialProvider?`,
    name: RouteNames.AuthPage,
    component: () => import('pages/AuthPage.vue'),
    meta: {
      programmaticalNavigation: false,
    },
  },
  {
    path: `/${RoutePaths.AUTH_ACTIVATE}`,
    name: RouteNames.ActivationPage,
    component: () => import('pages/ActivationPage.vue'),
    meta: {
      programmaticalNavigation: false,
    },
    beforeEnter: () => {
      if (isServer()) {
        return true;
      }
      const user = api.core.useAuth().user;
      if (user?.active) {
        return { name: RouteNames.Home };
      }
      return true;
    },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: () => {
      if (isServer()) {
        return true;
      }
      const fileManager = api.core.useFileSystemManager();

      const available = fileManager.currentFsName;
      if (!available) {
        return { name: RouteNames.Onboarding };
      }
      return true;
    },
    children: [
      {
        path: '',
        name: RouteNames.Home,

        redirect: { name: RouteNames.Panes },
      },
      {
        path: 'panes',
        name: RouteNames.Panes,
        component: () => import('pages/PanesPage.vue'),
      },

    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: RouteNames.NotFound,
    redirect: { name: RouteNames.Home },
  },
];

export default routes;
