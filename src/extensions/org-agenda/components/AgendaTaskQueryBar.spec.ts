import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type * as VueI18n from 'vue-i18n';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';

vi.mock('vue-i18n', async () => ({
  ...((await vi.importActual('vue-i18n')) as typeof VueI18n),
  useI18n: () => ({ t: (key: string, params?: { count?: number }) => `${key}:${params?.count ?? ''}` }),
}));

const SearchInputStub = defineComponent({
  name: 'SearchInput',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup: (_, { slots }) => () => h('div', [slots.actions?.()]),
});

const CommandActionButtonStub = defineComponent({
  name: 'CommandActionButton',
  props: ['command'],
  setup: () => () => h('button'),
});

beforeEach(() => {
  setActivePinia(createPinia());
});

test('AgendaTaskQueryBar updates the Agenda search query', async () => {
  const { default: AgendaTaskQueryBar } = await import('./AgendaTaskQueryBar.vue');
  const wrapper = mount(AgendaTaskQueryBar, {
    props: { resultCount: 4 },
    global: {
      stubs: {
        SearchInput: SearchInputStub,
        CommandActionButton: CommandActionButtonStub,
      },
    },
  });

  await wrapper.findComponent(SearchInputStub).vm.$emit('update:modelValue', 'quarterly');

  expect(useAgendaFilterStore().searchQuery).toBe('quarterly');
});

test('AgendaTaskQueryBar shows the selected range and date commands', async () => {
  const store = useAgendaFilterStore();
  store.setDateRange('2026-05-14', '2026-05-18');
  const { default: AgendaTaskQueryBar } = await import('./AgendaTaskQueryBar.vue');
  const wrapper = mount(AgendaTaskQueryBar, {
    props: { resultCount: 4 },
    global: {
      stubs: {
        SearchInput: SearchInputStub,
        CommandActionButton: CommandActionButtonStub,
      },
    },
  });

  const commands = wrapper
    .findAllComponents(CommandActionButtonStub)
    .map((button) => button.props('command'));

  expect(wrapper.text()).toContain('May 14, 2026 – May 18, 2026');
  expect(commands).toContain('agenda tasks: choose dates');
  expect(commands).toContain('agenda tasks: clear dates');
});
