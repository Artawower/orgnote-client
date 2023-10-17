import { useAuthStore } from 'src/stores/auth';
import { RouteRecordRaw } from 'vue-router';

export enum RouteNames {
  Home = 'Home',
  UserNotes = 'UserNotes',
  NoteList = 'NoteList',
  NoteDetail = 'NoteDetail',
  AuthPage = 'AuthPage',
  NotFound = 'NotFound',
  UserGraph = 'UserGraph',
  EditNote = 'EditNote',
  ApiSettings = 'ApiSettings',
  ViewSettings = 'ViewSettings',
  CommonSettings = 'CommonSettings',
  Extensions = 'Extensions',
  Keybindings = 'Keybindings',

  RawEditor = 'Raw editor',
  WysiwygEditor = 'WYSIWYG editor',
  PreviewEditor = 'Preview editor',
  Dashboard = 'Dashboard',
}
export const AUTH_PAGE_ROUTE: RouteRecordRaw = {
  path: 'auth/login/:initialProvider?',
  name: RouteNames.AuthPage,
  component: () => import('pages/AuthPage.vue'),
  meta: {
    programmaticalNavigation: false,
  },
};

export const MAIN_PAGE_ROUTE: RouteRecordRaw = {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  name: RouteNames.Home,
  children: [
    AUTH_PAGE_ROUTE,
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
      path: 'note-editor/:id?',
      name: RouteNames.EditNote,
      component: () => import('pages/NoteEditorPage.vue'),
      redirect: { name: RouteNames.RawEditor },
      children: [
        {
          path: 'raw',
          name: RouteNames.RawEditor,
          component: () => import('pages/NoteRawEditorPage.vue'),
        },
        {
          name: RouteNames.PreviewEditor,
          path: 'preview',
          component: () => import('pages/NotePreviewEditorPage.vue'),
        },
      ],
    },
    {
      path: 'detail/:id',
      name: RouteNames.NoteDetail,
      component: () => import('pages/NoteDetailPage.vue'),
    },
    {
      path: ':userId/graph',
      name: RouteNames.UserGraph,
      component: () => import('pages/UserGraphPage.vue'),
    },
    {
      path: ':userId',
      name: RouteNames.UserNotes,
      component: () => import('pages/PrivateNotesPage.vue'),
    },
    {
      path: '',
      name: RouteNames.Dashboard,
      component: () => import('pages/DashboardPage.vue'),
    },
    {
      path: 'feed',
      name: RouteNames.NoteList,
      component: () => import('pages/PublicNotesPage.vue'),
    },
    {
      path: '/:catchAll(.*)*',
      name: RouteNames.NotFound,
      component: () => import('pages/ErrorNotFoundPage.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [MAIN_PAGE_ROUTE];

export default routes;
