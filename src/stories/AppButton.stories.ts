import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { StyleVariant } from 'orgnote-api';
import AppButton from 'src/components/AppButton.vue';

interface ButtonArgs {
  type?: StyleVariant;
  outline?: boolean;
  disabled?: boolean;
}

const meta: Meta<ButtonArgs> = {
  component: AppButton,
  title: 'Buttons',
  tags: ['autodocs'],
  args: {
    type: 'info',
    outline: false,
  },
};

export default meta;

type Story = StoryObj<ButtonArgs>;

export const Default: Story = {
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<app-button v-bind="args">Click</app-button>',
  }),
};

export const Outlined: Story = {
  args: {
    outline: true,
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<app-button v-bind="args">Click</app-button>',
  }),
};

export const Link: Story = {
  args: {
    type: 'link',
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<app-button v-bind="args">Skip setup</app-button>',
  }),
};

export const LinkDisabled: Story = {
  args: {
    type: 'link',
    disabled: true,
  },
  render: (args) => ({
    components: { AppButton },
    setup() {
      return { args };
    },
    template: '<app-button v-bind="args">Skip setup</app-button>',
  }),
};

export const AllTypes: Story = {
  render: () => ({
    components: { AppButton },
    setup() {
      const types: { type: StyleVariant; label: string }[] = [
        { type: 'plain', label: 'Plain' },
        { type: 'info', label: 'Info' },
        { type: 'active', label: 'Active' },
        { type: 'warning', label: 'Warning' },
        { type: 'danger', label: 'Danger' },
        { type: 'link', label: 'Skip setup' },
      ];
      return { types };
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
        <app-button v-for="item in types" :key="item.type" :type="item.type">
          {{ item.label }}
        </app-button>
      </div>
    `,
  }),
};
