import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { defineComponent, h, shallowRef } from 'vue';
import { RouteNames, type BufferViewerEntry } from 'orgnote-api';
import { TAB_ROUTER_KEY } from 'src/constants/context-providers';
import FilePage from './FilePage.vue';

const StatefulViewer = defineComponent({
  name: 'StatefulViewer',
  props: ['buffer', 'readonly', 'viewState'],
  setup: () => () => h('div'),
});

let viewerEntry: BufferViewerEntry;
const updateBuffer = vi.fn();
const buffer = {
  uri: 'file:///notes/example.org',
  path: '/notes/example.org',
  text: '* Example',
  errors: [],
};

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useBuffers: () => ({
        getBufferByUri: () => buffer,
        updateBuffer,
      }),
      useBufferViewer: () => ({ getViewer: () => viewerEntry }),
    },
    ui: {
      useScreenDetection: () => ({ tabletBelow: false }),
    },
  },
}));

const mountFilePage = () =>
  mount(FilePage, {
    global: {
      provide: {
        [TAB_ROUTER_KEY as symbol]: shallowRef({
          currentRoute: shallowRef({
            name: RouteNames.File,
            params: { path: '/notes/example.org', tabId: 'tab-1' },
          }),
        }),
      },
      stubs: {
        MainHeader: true,
        FileNotSupported: true,
        LoadingDots: true,
      },
    },
  });

beforeEach(() => {
  setActivePinia(createPinia());
  updateBuffer.mockReset();
  viewerEntry = {
    pattern: '\\.org$',
    component: StatefulViewer,
    meta: {
      id: 'test:stateful-viewer',
      name: 'Stateful Viewer',
      viewState: { version: 1 },
    },
  };
});

test('FilePage gives opted-in viewers a tab-scoped state handle', () => {
  const wrapper = mountFilePage();
  const handle = wrapper.getComponent(StatefulViewer).props('viewState');

  handle.set({ custom: { expanded: true } });

  expect(handle.get()).toEqual({ custom: { expanded: true } });
});

test('FilePage does not pass state handles to viewers without opt-in metadata', () => {
  viewerEntry.meta.viewState = undefined;

  const wrapper = mountFilePage();

  expect(wrapper.getComponent(StatefulViewer).props('viewState')).toBeUndefined();
});
