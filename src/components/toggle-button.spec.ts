import { mount } from '@vue/test-utils';
import { vi, test, expect } from 'vitest';
import ToggleButton from './ToggleButton.vue';

test('renders the switch component with default props', () => {
  const wrapper = mount(ToggleButton);

  const input = wrapper.find('input.switch');
  const label = wrapper.find('label');
  const container = wrapper.find('.switch__container');

  expect(container.exists()).toBe(true);
  expect(input.exists()).toBe(true);
  expect(input.attributes('type')).toBe('checkbox');
  expect(label.exists()).toBe(true);
  expect(label.attributes('for')).toBe(input.attributes('id'));
});

test('renders the switch component with "flat" type by default', () => {
  const wrapper = mount(ToggleButton);

  const input = wrapper.find('input.switch');

  expect(input.exists()).toBe(true);
  expect(input.classes()).toContain('switch--flat');
});

test('binds the v-model correctly', async () => {
  const wrapper = mount(ToggleButton, {
    props: { modelValue: false },
  });

  const input = wrapper.find('input.switch');

  expect((input.element as HTMLInputElement).checked).toBe(false);

  await input.setValue(true);
  expect((input.element as HTMLInputElement).checked).toBe(true);
});

test('prevents default click on the container', async () => {
  const wrapper = mount(ToggleButton);

  const container = wrapper.find('.switch__container');
  const preventDefaultSpy = vi.fn();

  await container.trigger('click', { preventDefault: preventDefaultSpy });

  expect(preventDefaultSpy).toHaveBeenCalled();
});
