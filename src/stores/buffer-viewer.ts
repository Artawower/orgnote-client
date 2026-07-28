import {
  parseBufferUri,
  RouteNames,
  type BufferViewerStore,
  type BufferViewerEntry,
} from 'orgnote-api';
import { defineStore } from 'pinia';
import {
  defineAsyncComponent,
  shallowRef,
  type AsyncComponentLoader,
  type Component,
} from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { usePaneStore } from './pane';
import { useConfigStore } from './config';

const getRouteNameForScheme = (scheme: string): string => {
  const mapping: Record<string, string> = {
    file: RouteNames.File,
    remote: RouteNames.Remote,
    memory: RouteNames.File,
    shared: RouteNames.File,
    embedded: RouteNames.Embedded,
    builtin: RouteNames.Builtin,
  };
  return mapping[scheme] ?? RouteNames.File;
};

const DEFAULT_PRIORITY = 10;

const sortByPriority = (a: BufferViewerEntry, b: BufferViewerEntry): number =>
  (b.meta.priority ?? DEFAULT_PRIORITY) - (a.meta.priority ?? DEFAULT_PRIORITY);

const findById = (viewers: BufferViewerEntry[], id: string): BufferViewerEntry | undefined =>
  viewers.find((v) => v.meta.id === id);

const normalizeViewerEntry = (entry: BufferViewerEntry): BufferViewerEntry => {
  if (typeof entry.component !== 'function') return entry;
  return {
    ...entry,
    component: defineAsyncComponent(entry.component as AsyncComponentLoader<Component>),
  };
};

const getExtensionCandidates = (path: string): string[] => {
  const fileName = path.split('/').pop() ?? '';
  const parts = fileName.split('.').slice(1);
  if (parts.length === 0) return [];
  return parts.map((_, index) => parts.slice(index).join('.'));
};

export const useBufferViewerStore = defineStore<string, BufferViewerStore>(
  'buffer-viewer',
  (): BufferViewerStore => {
    const viewers = shallowRef<BufferViewerEntry[]>([]);

    const pane = usePaneStore();
    const configStore = useConfigStore();

    const getPreferredViewerId = (path: string): string | undefined => {
      const preferredReaders = configStore.config.fileReaders?.preferredReaders;
      if (!preferredReaders) return undefined;

      return getExtensionCandidates(path)
        .map((extension) => preferredReaders[extension])
        .find((id) => !!id);
    };

    const findPreferredViewer = (
      matching: BufferViewerEntry[],
      path: string,
    ): BufferViewerEntry | undefined => {
      const preferredId = getPreferredViewerId(path);
      if (!preferredId) return undefined;
      return findById(matching, preferredId);
    };

    const register = (entry: BufferViewerEntry): void => {
      viewers.value = [...viewers.value, normalizeViewerEntry(entry)];
    };

    const unregister = (viewerId: string): void => {
      viewers.value = viewers.value.filter((v) => v.meta.id !== viewerId);
    };

    const getViewers = (path: string): BufferViewerEntry[] => {
      return viewers.value.filter((v) => new RegExp(v.pattern).test(path)).sort(sortByPriority);
    };

    const getViewer = (path: string): BufferViewerEntry | undefined => {
      const matching = getViewers(path);
      if (!matching.length) return undefined;
      return findPreferredViewer(matching, path) ?? matching[0];
    };

    const buildRouteLocation = (uri: string): RouteLocationRaw => {
      const { scheme, path } = parseBufferUri(uri);
      return {
        name: getRouteNameForScheme(scheme),
        params: { path },
      };
    };

    const openInNewTab = async (route: RouteLocationRaw): Promise<boolean> => {
      const paneId = pane.activePaneId;
      if (!paneId) return false;
      const tab = await pane.addTab(paneId);
      if (!tab) return false;
      await pane.navigate(route, tab.paneId, tab.id);
      return true;
    };

    const open = async (uri: string): Promise<void> => {
      const route = buildRouteLocation(uri);
      if (pane.activeTab?.router) {
        await pane.navigate(route);
        return;
      }
      const opened = await openInNewTab(route);
      if (!opened) throw new Error('buffer-viewer.open: no active pane available');
    };

    return {
      register,
      unregister,
      getViewers,
      getViewer,
      open,
    };
  },
);
