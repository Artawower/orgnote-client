import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref, shallowRef } from 'vue';
import { beforeEach, expect, test, vi } from 'vitest';
import AppPane from './AppPane.vue';

const apiMocks = vi.hoisted(() => ({
  useLayout: vi.fn(),
  usePane: vi.fn(),
  useRightSidebar: vi.fn(),
  useScreenDetection: vi.fn(),
}));

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useLayout: apiMocks.useLayout,
      usePane: apiMocks.usePane,
    },
    ui: {
      useRightSidebar: apiMocks.useRightSidebar,
      useScreenDetection: apiMocks.useScreenDetection,
    },
  },
}));

const DropZoneOverlayStub = defineComponent({
  emits: ['drop'],
  template: '<button data-testid="drop-zone" @click="$emit(\'drop\', \'right\')" />',
});

const ContainerLayoutStub = defineComponent({
  template: '<div><slot name="header" /><slot name="body" /><slot /></div>',
});

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.useScreenDetection.mockReturnValue({ tabletAbove: ref(true) });
  apiMocks.useRightSidebar.mockReturnValue({ opened: ref(false) });
});

test('AppPane rolls back a newly split pane when moving the dragged tab fails', async () => {
  const closePane = vi.fn();
  const moveTab = vi.fn().mockResolvedValue(undefined);
  const setActivePane = vi.fn();
  const removePaneFromLayout = vi.fn();
  const splitPaneInLayout = vi.fn().mockResolvedValue('new-pane');
  apiMocks.usePane.mockReturnValue({
    activePaneId: 'target-pane',
    closePane,
    draggedTabData: { paneId: 'source-pane', tabId: 'dragged-tab' },
    isDraggingTab: true,
    moveTab,
    panes: {
      'source-pane': shallowRef({ activeTabId: '', id: 'source-pane', tabs: shallowRef({}) }),
      'target-pane': shallowRef({ activeTabId: '', id: 'target-pane', tabs: shallowRef({}) }),
    },
    selectTab: vi.fn(),
    setActivePane,
    startDraggingTab: vi.fn(),
    stopDraggingTab: vi.fn(),
  });
  apiMocks.useLayout.mockReturnValue({
    getPanePosition: vi.fn(),
    removePaneFromLayout,
    splitPaneInLayout,
  });

  const wrapper = mount(AppPane, {
    props: { paneId: 'target-pane' },
    global: {
      stubs: {
        ActionButton: true,
        CommandActionButton: true,
        ContainerLayout: ContainerLayoutStub,
        ContextMenu: true,
        DropZoneOverlay: DropZoneOverlayStub,
        NavTab: true,
        NavTabs: true,
        ScopedRouterView: true,
      },
    },
  });
  await wrapper.get('[data-testid="drop-zone"]').trigger('click');
  await flushPromises();

  expect(closePane).toHaveBeenCalledWith('new-pane');
  expect(removePaneFromLayout).toHaveBeenCalledWith('new-pane');
  expect(setActivePane).toHaveBeenCalledWith('source-pane');
});
