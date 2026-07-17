import { expect, test, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import type * as VueI18n from 'vue-i18n';

vi.mock('vue-i18n', async () => ({
  ...((await vi.importActual('vue-i18n')) as typeof VueI18n),
  useI18n: () => ({ t: (key: string) => key }),
}));

const AppDatePickerStub = defineComponent({
  name: 'AppDatePicker',
  props: ['modelValue', 'mode'],
  emits: ['update:modelValue'],
  setup: () => () => h('div'),
});

const AppSegmentedControlStub = defineComponent({
  name: 'AppSegmentedControl',
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  setup: () => () => h('div'),
});

test('DateRangePickerModal applies a selected single day', async () => {
  const { default: DateRangePickerModal } = await import('./DateRangePickerModal.vue');
  const wrapper = mount(DateRangePickerModal, {
    props: { from: '2026-05-14', to: '2026-05-14' },
    global: {
      stubs: {
        AppDatePicker: AppDatePickerStub,
        AppSegmentedControl: AppSegmentedControlStub,
      },
    },
  });

  await wrapper.findComponent(AppDatePickerStub).vm.$emit('update:modelValue', '2026/05/16');
  await wrapper.find('.apply').trigger('click');

  expect(wrapper.emitted('apply')).toEqual([
    [{ from: '2026-05-16', to: '2026-05-16' }],
  ]);
});

test('DateRangePickerModal emits clear and cancel actions', async () => {
  const { default: DateRangePickerModal } = await import('./DateRangePickerModal.vue');
  const wrapper = mount(DateRangePickerModal, {
    props: { from: '2026-05-14', to: '2026-05-14' },
    global: {
      stubs: {
        AppDatePicker: AppDatePickerStub,
        AppSegmentedControl: AppSegmentedControlStub,
      },
    },
  });

  await wrapper.find('.clear').trigger('click');
  await wrapper.find('.cancel').trigger('click');

  expect(wrapper.emitted('clear')).toHaveLength(1);
  expect(wrapper.emitted('cancel')).toHaveLength(1);
});

test('DateRangePickerModal applies a selected date range', async () => {
  const { default: DateRangePickerModal } = await import('./DateRangePickerModal.vue');
  const wrapper = mount(DateRangePickerModal, {
    props: { from: '2026-05-14', to: '2026-05-14' },
    global: {
      stubs: {
        AppDatePicker: AppDatePickerStub,
        AppSegmentedControl: AppSegmentedControlStub,
      },
    },
  });

  await wrapper.findComponent(AppSegmentedControlStub).vm.$emit('update:modelValue', 'range');
  await wrapper.findComponent(AppDatePickerStub).vm.$emit('update:modelValue', {
    from: '2026/05/14',
    to: '2026/05/18',
  });
  await wrapper.find('.apply').trigger('click');

  expect(wrapper.emitted('apply')).toEqual([
    [{ from: '2026-05-14', to: '2026-05-18' }],
  ]);
});
