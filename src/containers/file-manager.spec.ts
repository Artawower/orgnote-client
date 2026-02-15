import { expect, test, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';

let fileManagerPath: ReturnType<typeof ref<string>>;
let fileManagerSearchQuery: ReturnType<typeof ref<string>>;
let fileManagerMobileFileSearchActive: ReturnType<typeof ref<boolean>>;
let tabletBelow: ReturnType<typeof ref<boolean>>;

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileManager: () => ({
        path: fileManagerPath,
        searchQuery: fileManagerSearchQuery,
        mobileFileSearchActive: fileManagerMobileFileSearchActive,
        selectedFiles: ref(new Set<string>()),
        selectionMode: ref(false),
        pendingOperation: ref(undefined),
        operationTargets: ref([]),
        focusFile: ref(undefined),
        files: ref([]),
        sortConfig: ref({ field: 'name', direction: 'asc', directoriesFirst: true }),
        sortedFiles: ref([]),
        toggleSelection: vi.fn(),
        clearSelection: vi.fn(),
        loadFiles: vi.fn(),
      }),
      useBufferViewer: () => ({ open: vi.fn() }),
      usePane: () => ({ activeTab: undefined }),
    },
    ui: {
      useSidebar: () => ({ close: vi.fn() }),
      useScreenDetection: () => ({ tabletBelow }),
      useContextMenu: () => ({
        show: vi.fn(),
        hide: vi.fn(),
        visible: ref(false),
      }),
      useModal: () => ({
        open: vi.fn(),
        close: vi.fn(),
      }),
    },
  },
}));

import FileManager from './FileManager.vue';

beforeEach(() => {
  fileManagerPath = ref('/initial');
  fileManagerSearchQuery = ref('');
  fileManagerMobileFileSearchActive = ref(false);
  tabletBelow = ref(false);
});

test('FileManager shows header search on desktop regardless of compact', async () => {
  tabletBelow.value = false;
  const wrapper = mount(FileManager, {
    props: { path: '/initial', compact: true },
  });
  await nextTick();

  const searchInput = wrapper.findComponent({ name: 'SearchInput' });
  expect(searchInput.exists()).toBe(true);
});

test('FileManager hides header search on mobile when compact', async () => {
  tabletBelow.value = true;
  const wrapper = mount(FileManager, {
    props: { path: '/initial', compact: true },
  });
  await nextTick();

  const searchInput = wrapper.findComponent({ name: 'SearchInput' });
  expect(searchInput.exists()).toBe(false);
});

test('FileManager shows header search on mobile when not compact', async () => {
  tabletBelow.value = true;
  const wrapper = mount(FileManager, {
    props: { path: '/initial', compact: false },
  });
  await nextTick();

  const searchInput = wrapper.findComponent({ name: 'SearchInput' });
  expect(searchInput.exists()).toBe(true);
});

test('FileManager uses store search query for filtering', async () => {
  fileManagerSearchQuery.value = 'test-query';
  const wrapper = mount(FileManager, {
    props: { path: '/initial' },
  });
  await nextTick();

  const searchInput = wrapper.findComponent({ name: 'SearchInput' });
  expect(searchInput.exists()).toBe(true);
  expect(searchInput.props('modelValue')).toBe('test-query');
});
