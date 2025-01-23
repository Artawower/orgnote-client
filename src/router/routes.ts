import { RouteNames } from 'orgnote-api';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    name: RouteNames.Home,
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
