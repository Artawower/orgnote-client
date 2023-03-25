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
  CreateNote = 'CreateNote',
  EditNote = 'EditNote',
  ApiSettings = 'ApiSettings',
  ViewSettings = 'ViewSettings',
  Extensions = 'Extensions',
  Keybindings = 'Keybindings',
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
      path: 'extensions',
      name: RouteNames.Extensions,
      component: () => import('pages/ExtensionsPage.vue'),
      beforeEnter: () => {
        const authStore = useAuthStore();
        if (!authStore.user) {
          return { name: RouteNames.NoteList };
        }
        return true;
      },
    },
    {
      path: 'settings',
      name: RouteNames.Settings,
      component: () => import('pages/SettingsPage.vue'),
      redirect: { name: RouteNames.ViewSettings },
      beforeEnter: () => {
        const authStore = useAuthStore();
        if (!authStore.user) {
          return { name: RouteNames.NoteList };
        }
        return true;
      },
      children: [
        {
          path: '',
          name: RouteNames.ViewSettings,
          component: () => import('pages/ViewSettingsPage.vue'),
        },
        {
          path: 'api',
          name: RouteNames.ApiSettings,
          component: () => import('pages/ApiSettingsPage.vue'),
        },
        {
          path: 'keybindings',
          name: RouteNames.Keybindings,
          component: () => import('pages/KeybindingsPage.vue'),
        },
      ],
    },
    {
      path: 'create-note',
      name: RouteNames.CreateNote,
      component: () => import('pages/NoteEditor.vue'),
    },
    {
      path: 'edit-note/:id',
      name: RouteNames.EditNote,
      component: () => import('pages/NoteEditor.vue'),
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
      path: ':userId',
      name: RouteNames.UserNotes,
      component: () => import('pages/IndexPage.vue'),
    },
    {
      path: '',
      name: RouteNames.NoteList,
      component: () => import('pages/IndexPage.vue'),
    },
    {
      path: '/:catchAll(.*)*',
      name: RouteNames.NotFound,
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [MAIN_PAGE_ROUTE];

export default routes;
