import { RouteNames } from 'orgnote-api';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    name: RouteNames.Home,
  },
];

export default routes;
