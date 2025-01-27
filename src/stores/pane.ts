import type { InitialPaneParams, Page, Pane } from 'orgnote-api';
import { RouteNames, type PaneStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { UNTITLED_PAGE } from 'src/constants/untitled-page';
import { v4 } from 'uuid';
import { computed } from 'vue';
import { shallowRef } from 'vue';
import type { Router } from 'vue-router';
import { createMemoryHistory, createRouter } from 'vue-router';

export const initPageRouter = async (): Promise<Router> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: RouteNames.InitialPage,
        component: () => import('src/pages/InitialPage.vue'),
      },
    ],
  });
  router.push({ name: RouteNames.InitialPage });
  return router;
};

export const usePaneStore = defineStore<'panes', PaneStore>(
  'panes',
  () => {
    const panes = shallowRef<Record<string, Pane>>({});
    const activePaneId = shallowRef<string | null>(null);

    const activePane = computed(() => panes.value[activePaneId.value]);

    const initNewPage = async (params?: Partial<Pick<Page, 'title' | 'id'>>): Promise<Page> => {
      const router = await initPageRouter();
      return {
        title: params?.title || UNTITLED_PAGE,
        id: params?.id || v4(),
        router,
      };
    };

    const initNewPane = async (params?: InitialPaneParams): Promise<Pane> => {
      const newPage = await initNewPage(params);
      const paneId = v4();
      const pane: Pane = {
        id: paneId,
        activePageId: newPage.id,
        pages: {
          [newPage.id]: newPage,
        },
      };

      activePaneId.value = paneId;
      panes.value = {
        ...panes.value,
        [paneId]: pane,
      };

      return pane;
    };

    const getPane = (id: string): Pane => panes.value[id];

    const addPage = async (params?: InitialPaneParams) => {
      const page = await initNewPage(params);
      panes.value = {
        ...panes.value,
        [activePaneId.value]: {
          ...panes.value[activePaneId.value],
          pages: {
            ...panes.value[activePaneId.value].pages,
            [page.id]: page,
          },
        },
      };

      return page;
    };

    const selectPage = (paneId: string, pageId: string) => {
      activePaneId.value = paneId;
      panes.value = {
        ...panes.value,
        [paneId]: {
          ...panes.value[paneId],
          activePageId: pageId,
        },
      };
    };

    const closePage = (paneId: string, pageId: string) => {
      const pane = panes.value[paneId];
      const pages = { ...pane.pages };
      delete pages[pageId];
      const pageIds = Object.keys(pages);
      const lastPageId = pageIds[pageIds.length - 1];
      pane.activePageId = lastPageId;

      panes.value = {
        ...panes.value,
        [paneId]: {
          ...pane,
          pages,
        },
      };
    };

    const store: PaneStore = {
      panes,
      activePane,
      initNewPane,
      getPane,
      activePaneId,
      addPage,
      selectPage,
      closePage,
    };
    return store;
  },
  { persist: true },
);
