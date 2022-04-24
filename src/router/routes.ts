import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  Home = 'Home',
  NoteView = 'NoteView',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: ':id',
        name: RouteNames.NoteView,
        component: () => import('pages/NoteView.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
