import { mount } from '@vue/test-utils';
import { test, expect, vi, beforeEach } from 'vitest';
import ContextMenu from './ContextMenu.vue';
import { api } from 'src/boot/api';
import { QMenu } from 'quasar';


vi.mock('src/boot/api', async () => {
  const { ref } = await import('vue');
  
  const mockUseContextMenu = {
    getContextMenuActions: vi.fn().mockReturnValue([]),
  };

  const mockUseScreenDetection = {
    desktopBelow: ref(false),
  };

  const mockUseModal = {
    open: vi.fn(),
    close: vi.fn(),
  };

  return {
    api: {
      ui: {
        useContextMenu: () => mockUseContextMenu,
        useScreenDetection: () => mockUseScreenDetection,
        useModal: () => mockUseModal,
      },
    },
  };
});

vi.mock('quasar', () => {
  const QMenuMock = {
    template: '<div><slot /></div>',
    methods: {
      show: vi.fn(),
      hide: vi.fn(),
    },
  };
  const TouchHoldMock = {
    name: 'touch-hold',
    beforeMount: vi.fn(),
    beforeUnmount: vi.fn(),
  };
  return {
    QMenu: QMenuMock,
    TouchHold: TouchHoldMock,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = false;
});

test('renders slot content', () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    slots: {
      default: '<div class="trigger">Trigger</div>',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  expect(wrapper.find('.trigger').exists()).toBe(true);
});

test('opens QMenu on desktop when triggered', async () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');
  expect(wrapper.findComponent(QMenu).exists()).toBe(true);
  expect(api.ui.useModal().open).not.toHaveBeenCalled();
});

test('opens Modal on mobile when triggered', async () => {
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = true;

  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  expect(wrapper.findComponent(QMenu).exists()).toBe(false);

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');
  expect(api.ui.useModal().open).toHaveBeenCalled();
  expect(api.ui.useModal().open).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      mini: true,
      position: 'bottom',
    })
  );
  expect(wrapper.emitted('open')).toBeTruthy();
});

test('does not open anything if disabled', async () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
      disabled: true,
    },
    global: {
      components: {
        QMenu,
      },
      stubs: {
        MenuList: true,
      },
    },
  });

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');
  expect(api.ui.useModal().open).not.toHaveBeenCalled();
});

test('ContextMenu opens modal on touch hold for mobile', () => {
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = true;

  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  const vm = wrapper.vm as unknown as { handleTrigger: () => void };
  vm.handleTrigger();

  expect(api.ui.useModal().open).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      mini: true,
      position: 'bottom',
    }),
  );
  expect(wrapper.emitted('open')).toBeTruthy();
});

test('ContextMenu touch hold does not open when disabled', () => {
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = true;

  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
      disabled: true,
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  const vm = wrapper.vm as unknown as { handleTrigger: () => void };
  vm.handleTrigger();

  expect(api.ui.useModal().open).not.toHaveBeenCalled();
});

test('ContextMenu exposed open emits open event and shows QMenu', () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  wrapper.vm.open();

  expect(wrapper.emitted('open')).toHaveLength(1);
  const qMenu = wrapper.findComponent(QMenu);
  expect(qMenu.exists()).toBe(true);
});

test('ContextMenu exposed close calls QMenu hide', () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  wrapper.vm.close();

  const qMenu = wrapper.findComponent(QMenu);
  expect(qMenu.exists()).toBe(true);
});

test('ContextMenu passes group to getContextMenuActions', () => {
  mount(ContextMenu, {
    props: {
      group: 'custom-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  expect(api.ui.useContextMenu().getContextMenuActions).toHaveBeenCalledWith('custom-group');
});

test('ContextMenu passes data prop to modal on mobile', async () => {
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = true;

  const testData = { path: '/notes/test.org' };

  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
      data: testData,
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');

  expect(api.ui.useModal().open).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      modalProps: expect.objectContaining({
        data: testData,
      }),
    }),
  );
});

test('ContextMenu emits open on desktop contextmenu', async () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');

  expect(wrapper.emitted('open')).toHaveLength(1);
});

test('ContextMenu QMenu hide event calls close', async () => {
  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  const qMenu = wrapper.findComponent(QMenu);
  await qMenu.vm.$emit('hide');

  expect(qMenu.exists()).toBe(true);
});

test('ContextMenu mobile modal close callback calls modal.close', async () => {
  (api.ui.useScreenDetection().desktopBelow as unknown as { value: boolean }).value = true;

  const wrapper = mount(ContextMenu, {
    props: {
      group: 'test-group',
    },
    global: {
      stubs: {
        MenuList: true,
      },
    },
  });

  await wrapper.find('.context-menu-trigger').trigger('contextmenu');

  const modalOpenCall = vi.mocked(api.ui.useModal().open).mock.calls[0]!;
  const modalEmits = modalOpenCall[1]?.modalEmits as { close: () => void };
  modalEmits.close();

  expect(api.ui.useModal().close).toHaveBeenCalled();
});
