import { Platform } from 'quasar';
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
  SettingsPage = 'SettingsPage',
  SystemSettings = 'SystemSettings',
  ExtensionsSettings = 'ExtensionsSettings',
  LanguageSettings = 'LanguageSettings',
  InterfaceSettings = 'InterfaceSettings',
  KeybindingSettings = 'KeybindingSettings',
  DeveloperSettings = 'DeveloperSettings',
  EncryptionSettings = 'EncryptionSettings',
  SubscriptionSettings = 'SubscriptionSettings',
  ApiSettings = 'ApiSettings',
  SynchronisationSettings = 'SynchronisationSettings',
  Extensions = 'Extensions',
  Keybindings = 'Keybindings',
  RawEditor = 'Raw editor',
  WysiwygEditor = 'WYSIWYG editor',
  PreviewEditor = 'Preview editor',
  Dashboard = 'Dashboard',
  ActivationPage = 'ActivationPage',
  LoggerPage = 'LoggerPage',
}

function clientOnly(
  route: RouteRecordRaw['component']
): RouteRecordRaw['component'] {
  if (process.env.CLIENT) {
    return route;
  }
  return () => import('pages/PageLoading.vue');
}

export const AUTH_PAGE_ROUTE: RouteRecordRaw = {
  path: 'auth/login/:initialProvider?',
  name: RouteNames.AuthPage,
  component: () => import('pages/AuthPage.vue'),
  meta: {
    programmaticalNavigation: false,
  },
};

export const LOGGER_PAGE: RouteRecordRaw = {
  path: 'logger',
  name: RouteNames.LoggerPage,
  component: () => import('pages/LoggerPage.vue'),
};

export const ACTIVATION_PAGE: RouteRecordRaw = {
  path: 'auth/activate',
  name: RouteNames.ActivationPage,
  component: () => import('pages/ActivationPage.vue'),
  meta: {
    programmaticalNavigation: false,
  },
};

const settingsPages: RouteRecordRaw[] = [
  {
    path: 'system-settings',
    name: RouteNames.SystemSettings,
    component: clientOnly(() => import('pages/SystemSettingsPage.vue')),
    meta: {
      title: 'system',
    },
  },
  {
    path: 'language-settings',
    name: RouteNames.LanguageSettings,
    component: clientOnly(() => import('pages/LanguageSettingsPage.vue')),
    meta: {
      title: 'language',
    },
  },
  {
    path: 'interface-settings',
    name: RouteNames.InterfaceSettings,
    component: clientOnly(() => import('pages/InterfaceSettingsPage.vue')),
    meta: {
      title: 'interface',
    },
  },
  {
    path: 'keybinding-settings',
    name: RouteNames.KeybindingSettings,
    component: clientOnly(() => import('pages/KeybindingSettingsPage.vue')),
    meta: {
      title: 'keybindings',
    },
  },
  {
    path: 'developer-settings',
    name: RouteNames.DeveloperSettings,
    component: clientOnly(() => import('pages/DeveloperSettingsPage.vue')),
    meta: {
      title: 'developer',
    },
  },
  {
    path: 'extensions-settings',
    name: RouteNames.ExtensionsSettings,
    beforeEnter: () => {
      if (!process.env.CLIENT) {
        return;
      }
      const authStore = useAuthStore();
      if (!authStore.user) {
        return { name: RouteNames.NoteList };
      }
      return true;
    },
    component: clientOnly(() => import('pages/ExtensionsSettingsPage.vue')),
    meta: {
      title: 'extensions',
      icon: 'extension',
    },
  },
  {
    path: 'encryption-settings',
    name: RouteNames.EncryptionSettings,
    component: clientOnly(() => import('pages/EncryptionSettingsPage.vue')),
    meta: {
      title: 'encryption',
    },
  },
  {
    path: 'subscription-settings',
    name: RouteNames.SubscriptionSettings,
    component: clientOnly(() => import('pages/SubscriptionSettingsPage.vue')),
    meta: {
      title: 'subscription',
    },
  },
  {
    path: 'synchronisation-settings',
    name: RouteNames.SynchronisationSettings,
    component: clientOnly(
      () => import('pages/SynchronisationSettingsPage.vue')
    ),
    meta: {
      title: 'synchronisation',
    },
  },
  {
    path: 'api-settings',
    name: RouteNames.ApiSettings,
    component: clientOnly(() => import('pages/ApiSettingsPage.vue')),
    meta: {
      title: 'api',
    },
  },
  ...(process.env.CLIENT && Platform.is.desktop
    ? [
        {
          path: '',
          redirect: { name: RouteNames.SystemSettings },
        },
      ]
    : []),
];

export const MAIN_PAGE_ROUTE: RouteRecordRaw = {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  name: RouteNames.Home,
  children: [
    AUTH_PAGE_ROUTE,
    ACTIVATION_PAGE,
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
      component: clientOnly(() => import('pages/UserGraphPage.vue')),
    },
    {
      path: ':userId',
      name: RouteNames.UserNotes,
      component: () => import('pages/PrivateNotesPage.vue'),
    },
    {
      path: '',
      name: RouteNames.Dashboard,
      component: clientOnly(() => import('pages/DashboardPage.vue')),
      meta: {
        icon: 'dashboard',
      },
    },
    {
      path: 'feed',
      name: RouteNames.NoteList,
      component: () => import('pages/PublicNotesPage.vue'),
      meta: {
        icon: 'feed',
      },
    },
    {
      path: 'settings',
      name: RouteNames.SettingsPage,
      component: clientOnly(() => import('pages/SettingsPage.vue')),
      meta: {
        icon: 'settings',
        title: 'settings',
      },
      children: process.env.CLIENT && Platform.is.desktop ? settingsPages : [],
    },
    ...(process.env.CLIENT && Platform.is.mobile ? settingsPages : []),
    {
      path: '/:catchAll(.*)*',
      name: RouteNames.NotFound,
      component: () => import('pages/ErrorNotFoundPage.vue'),
    },
  ],
};

const routes: RouteRecordRaw[] = [MAIN_PAGE_ROUTE];

export default routes;
