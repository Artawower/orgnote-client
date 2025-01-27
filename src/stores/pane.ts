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
  return router;
};

export const usePaneStore = defineStore<'panes', PaneStore>('panes', () => {
  const panes = shallowRef<Record<string, Pane>>({});
  const activePaneId = shallowRef<string | null>(null);

  const activePane = computed(() => panes.value[activePaneId.value]);

  const initNewPage = async (params?: Partial<Pick<Page, 'title' | 'pageId'>>): Promise<Page> => {
    const router = await initPageRouter();
    return {
      title: params?.title || UNTITLED_PAGE,
      pageId: params?.pageId || v4(),
      router,
    };
  };

  const initNewPane = async (params?: InitialPaneParams): Promise<Pane> => {
    const newPage = await initNewPage(params);
    const pane: Pane = {
      activePageId: newPage.pageId,
      pages: {
        [newPage.pageId]: newPage,
      },
    };

    const paneId = v4();

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
          [page.pageId]: page,
        },
      },
    };

    return page;
  };

  const store: PaneStore = {
    panes,
    activePane,
    initNewPane,
    getPane,
    activePaneId,
    addPage,
  };
  return store;
});
