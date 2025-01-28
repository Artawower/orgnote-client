import { RouteNames } from 'orgnote-api';
import { api } from 'src/boot/api';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/onboarding',
    name: RouteNames.Onboarding,
    component: () => import('pages/OnboardingPage.vue'),
    beforeEnter: () => {
      const fileManager = api.core.useFileSystemManager();
      const fs = api.core.useFileSystem();

      const available = fileManager.currentFsName && fs.vault;
      if (available) {
        return { name: RouteNames.Home };
      }
      return true;
    },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    name: RouteNames.Home,
    beforeEnter: () => {
      const fileManager = api.core.useFileSystemManager();
      const fs = api.core.useFileSystem();

      const available = fileManager.currentFsName && fs.vault;
      if (!available) {
        return { name: RouteNames.Onboarding };
      }
      return true;
    },
    children: [
      {
        path: '',
        redirect: { name: RouteNames.Panes },
      },
      {
        path: 'panes',
        name: RouteNames.Panes,
        component: () => import('pages/PanesPage.vue'),
      },
    ],
  },
];

export default routes;
