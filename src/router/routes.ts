import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  Home = 'Home',
  NoteView = 'NoteView',
}

export const MAIN_PAGE_ROUTE: RouteRecordRaw = {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  name: RouteNames.Home,
  children: [
    { path: '', component: () => import('pages/IndexPage.vue') },
    {
      path: ':id',
      name: RouteNames.NoteView,
      component: () => import('pages/NoteView.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [
  MAIN_PAGE_ROUTE,
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
