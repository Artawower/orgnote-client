import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref, shallowRef } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import AppPane from './AppPane.vue';

const apiMocks = vi.hoisted(() => ({
  reportError: vi.fn(),
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

vi.mock('src/boot/report', () => ({
  reporter: { reportError: apiMocks.reportError },
}));

const DropZoneOverlayStub = defineComponent({
  emits: ['drop'],
  template: '<button data-testid="drop-zone" @click="$emit(\'drop\', \'right\')" />',
});

const ContainerLayoutStub = defineComponent({
  template: '<div><slot name="header" /><slot name="body" /><slot /></div>',
});

const SlotStub = defineComponent({
  template: '<div><slot /></div>',
});

const NavTabsStub = defineComponent({
  template: `
    <div>
      <slot name="navigation" />
      <slot />
      <slot name="actions" />
      <slot name="right-actions" />
    </div>
  `,
});

const NavTabStub = defineComponent({
  props: { paneId: String, tabId: String },
  emits: ['dragstart', 'dragend'],
  template: `
    <button data-testid="drag-start" @click="$emit('dragstart', { paneId, tabId })" />
    <button data-testid="drag-end" @click="$emit('dragend')" />
  `,
});

const mountAppPane = () =>
  mount(AppPane, {
    props: { paneId: 'target-pane' },
    global: {
      stubs: {
        ActionButton: true,
        CommandActionButton: true,
        ContainerLayout: ContainerLayoutStub,
        ContextMenu: SlotStub,
        DropZoneOverlay: DropZoneOverlayStub,
        NavTab: NavTabStub,
        NavTabs: NavTabsStub,
        ScopedRouterView: true,
      },
    },
  });

const configurePaneApi = (
  moveTab: ReturnType<typeof vi.fn>,
  splitPaneInLayout: ReturnType<typeof vi.fn>,
  targetTabs: Record<string, unknown> = {},
) => {
  const paneActions = {
    closePane: vi.fn(),
    selectTab: vi.fn(),
    setActivePane: vi.fn(),
    startDraggingTab: vi.fn(),
    stopDraggingTab: vi.fn(),
  };
  apiMocks.usePane.mockReturnValue({
    ...paneActions,
    activePaneId: 'target-pane',
    draggedTabData: { paneId: 'source-pane', tabId: 'dragged-tab' },
    isDraggingTab: true,
    moveTab,
    panes: {
      'source-pane': shallowRef({ activeTabId: '', id: 'source-pane', tabs: shallowRef({}) }),
      'target-pane': shallowRef({
        activeTabId: Object.keys(targetTabs)[0] ?? '',
        id: 'target-pane',
        tabs: shallowRef(targetTabs),
      }),
    },
  });
  const layoutActions = { getPanePosition: vi.fn(), removePaneFromLayout: vi.fn() };
  apiMocks.useLayout.mockReturnValue({ ...layoutActions, splitPaneInLayout });
  return { ...layoutActions, ...paneActions };
};

beforeEach(() => {
  vi.clearAllMocks();
  apiMocks.useScreenDetection.mockReturnValue({ tabletAbove: ref(true) });
  apiMocks.useRightSidebar.mockReturnValue({ opened: ref(false) });
});

afterEach(() => {
  vi.useRealTimers();
});

test('AppPane rolls back a newly split pane when moving the dragged tab fails', async () => {
  const actions = configurePaneApi(
    vi.fn().mockResolvedValue(undefined),
    vi.fn().mockResolvedValue('new-pane'),
  );
  const wrapper = mountAppPane();

  await wrapper.get('[data-testid="drop-zone"]').trigger('click');
  await flushPromises();

  expect(actions.closePane).toHaveBeenCalledWith('new-pane');
  expect(actions.removePaneFromLayout).toHaveBeenCalledWith('new-pane');
  expect(actions.setActivePane).toHaveBeenCalledWith('source-pane');
});

test('AppPane cancels deferred drag activation when drag ends immediately', async () => {
  vi.useFakeTimers();
  const tab = {
    id: 'target-tab',
    paneId: 'target-pane',
    router: { currentRoute: shallowRef({ fullPath: '/target-tab', params: {} }) },
    title: 'Target',
  };
  const actions = configurePaneApi(
    vi.fn().mockResolvedValue(tab),
    vi.fn().mockResolvedValue('new-pane'),
    { [tab.id]: tab },
  );
  const wrapper = mountAppPane();

  await wrapper.get('[data-testid="drag-start"]').trigger('click');
  await wrapper.get('[data-testid="drag-end"]').trigger('click');
  await vi.runAllTimersAsync();

  expect(actions.startDraggingTab).not.toHaveBeenCalled();
  expect(actions.stopDraggingTab).toHaveBeenCalledOnce();
});

test('AppPane clears drag state and reports a failed split', async () => {
  const splitError = new Error('split failed');
  const actions = configurePaneApi(
    vi.fn().mockResolvedValue(undefined),
    vi.fn().mockRejectedValue(splitError),
  );
  const wrapper = mountAppPane();

  await wrapper.get('[data-testid="drop-zone"]').trigger('click');
  await flushPromises();

  expect(actions.stopDraggingTab).toHaveBeenCalledOnce();
  expect(apiMocks.reportError).toHaveBeenCalledWith(splitError);
});
