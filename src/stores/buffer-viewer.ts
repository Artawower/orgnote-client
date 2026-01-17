import {
  parseBufferUri,
  RouteNames,
  type BufferViewerStore,
  type BufferViewerEntry,
} from 'orgnote-api';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { usePaneStore } from './pane';
import { useConfigStore } from './config';

const getRouteNameForScheme = (scheme: string): string => {
  const mapping: Record<string, string> = {
    file: RouteNames.File,
    remote: RouteNames.Remote,
    memory: RouteNames.File,
    shared: RouteNames.File,
    embedded: RouteNames.File,
  };
  return mapping[scheme] ?? RouteNames.File;
};

const DEFAULT_PRIORITY = 10;

const sortByPriority = (a: BufferViewerEntry, b: BufferViewerEntry): number =>
  (b.meta.priority ?? DEFAULT_PRIORITY) - (a.meta.priority ?? DEFAULT_PRIORITY);

const findById = (viewers: BufferViewerEntry[], id: string): BufferViewerEntry | undefined =>
  viewers.find((v) => v.meta.id === id);

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
      viewers.value = [...viewers.value, entry];
    };

    const unregister = (viewerId: string): void => {
      viewers.value = viewers.value.filter((v) => v.meta.id !== viewerId);
    };

    const getViewers = (path: string): BufferViewerEntry[] => {
      return viewers.value
        .filter((v) => new RegExp(v.pattern).test(path))
        .sort(sortByPriority);
    };

    const getViewer = (path: string): BufferViewerEntry | undefined => {
      const matching = getViewers(path);
      if (!matching.length) return undefined;
      return findPreferredViewer(matching, path) ?? matching[0];
    };

    const open = async (uri: string): Promise<void> => {
      const { scheme, path } = parseBufferUri(uri);
      const routeName = getRouteNameForScheme(scheme);

      await pane.navigate({
        name: routeName,
        params: { path },
      });
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
