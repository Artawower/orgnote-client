import { useAuthStore } from 'src/stores/auth';
import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  Home = 'Home',
  UserNotes = 'UserNotes',
  NoteList = 'NoteList',
  NoteDetail = 'NoteDetail',
  AuthPage = 'AuthPage',
  Settings = 'Settings',
  NotFound = 'NotFound',
  UserGraph = 'UserGraph',
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
      beforeEnter: () => {
        const authStore = useAuthStore();
        if (!authStore.user) {
          return { name: RouteNames.NoteList };
        }
        return true;
      },
    },
    {
      path: 'detail/:id',
      name: RouteNames.NoteDetail,
      component: () => import('pages/NoteDetail.vue'),
    },
    {
      path: ':userId/graph',
      name: RouteNames.UserGraph,
      component: () => import('pages/UserGraph.vue'),
    },
    {
      path: ':userId?',
      name: RouteNames.UserNotes,
      component: () => import('pages/IndexPage.vue'),
    },
    {
      path: '',
      name: RouteNames.NoteList,
      component: () => import('pages/IndexPage.vue'),
    },
    {
      path: '/:catchAll(.*)+',
      name: RouteNames.NotFound,
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [MAIN_PAGE_ROUTE];

export default routes;
