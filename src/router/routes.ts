import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  Home = 'Home',
  NoteList = 'NoteList',
  NoteView = 'NoteView',
  AuthPage = 'AuthPage',
  Settings = 'Settings',
}

export const MAIN_PAGE_ROUTE: RouteRecordRaw = {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  name: RouteNames.Home,
  children: [
    {
      path: 'auth/login',
      name: RouteNames.AuthPage,
      component: () => import('pages/AuthPage.vue'),
    },
    {
      path: 'settings',
      name: RouteNames.Settings,
      component: () => import('pages/SettingsPage.vue'),
    },
    {
      path: ':id',
      name: RouteNames.NoteView,
      component: () => import('pages/NoteView.vue'),
    },
    {
      path: '',
      name: RouteNames.NoteList,
      component: () => import('pages/IndexPage.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [
  MAIN_PAGE_ROUTE,
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
