import { afterEach, beforeEach, expect, test, vi } from 'vitest';
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

const DatePickerPopoverStub = defineComponent({
  name: 'DatePickerPopover',
  props: ['modelValue', 'selectionMode', 'confirmMode'],
  emits: ['confirm'],
  setup: (_, { slots }) => () => h('div', [slots.trigger?.({ open: vi.fn() })]),
});

const CommandActionButtonStub = defineComponent({
  name: 'CommandActionButton',
  props: ['command'],
  setup: () => () => h('button'),
});

const mountQueryBar = async () => {
  const { default: AgendaTaskQueryBar } = await import('./AgendaTaskQueryBar.vue');
  return mount(AgendaTaskQueryBar, {
    props: { resultCount: 4 },
    global: {
      stubs: {
        SearchInput: SearchInputStub,
        DatePickerPopover: DatePickerPopoverStub,
        CommandActionButton: CommandActionButtonStub,
      },
    },
  });
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.useRealTimers();
});

test('AgendaTaskQueryBar updates the Agenda search query', async () => {
  const wrapper = await mountQueryBar();

  await wrapper.findComponent(SearchInputStub).vm.$emit('update:modelValue', 'quarterly');

  expect(useAgendaFilterStore().searchQuery).toBe('quarterly');
});

test('AgendaTaskQueryBar maps a selected single Today to the Today preset', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-18T12:00:00'));
  const wrapper = await mountQueryBar();

  await wrapper.findComponent(DatePickerPopoverStub).vm.$emit('confirm', '2026-05-18');

  expect(useAgendaFilterStore().dateFilter).toEqual({ kind: 'preset', value: 'today' });
});

test('AgendaTaskQueryBar reopens a non-Today single selection in single mode', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-18T12:00:00'));
  const wrapper = await mountQueryBar();
  const picker = wrapper.findComponent(DatePickerPopoverStub);

  await picker.vm.$emit('confirm', '2026-05-20');
  await wrapper.vm.$nextTick();

  expect(useAgendaFilterStore().dateFilter).toEqual({
    kind: 'day',
    value: '2026-05-20',
  });
  expect(picker.props('modelValue')).toBe('2026-05-20');
});

test('AgendaTaskQueryBar applies a range selected from the responsive picker', async () => {
  const wrapper = await mountQueryBar();
  const picker = wrapper.findComponent(DatePickerPopoverStub);

  await picker.vm.$emit('confirm', { from: '2026-05-14', to: '2026-05-18' });

  expect(picker.props('selectionMode')).toBe('both');
  expect(useAgendaFilterStore().dateFilter).toEqual({
    kind: 'range',
    from: '2026-05-14',
    to: '2026-05-18',
  });
});

test('AgendaTaskQueryBar shows the selected range and clear command', async () => {
  useAgendaFilterStore().setDateRange('2026-05-14', '2026-05-18');
  const wrapper = await mountQueryBar();
  const commands = wrapper
    .findAllComponents(CommandActionButtonStub)
    .map((button) => button.props('command'));

  expect(wrapper.text()).toContain('May 14, 2026 – May 18, 2026');
  expect(commands).toEqual(['agenda tasks: clear dates']);
});
