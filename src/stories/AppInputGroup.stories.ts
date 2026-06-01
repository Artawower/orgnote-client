import type { StoryObj, Meta } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AppInputGroup from 'src/components/AppInputGroup.vue';
import AppBadge from 'src/components/AppBadge.vue';

const meta: Meta<typeof AppInputGroup> = {
  component: AppInputGroup,
  title: 'Forms/InputGroup',
  tags: ['autodocs'],
  args: {
    placeholder: 'Type something...',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof AppInputGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { AppInputGroup },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `<app-input-group v-model="value" v-bind="args" />`,
  }),
};

export const WithPrefix: Story = {
  render: (args) => ({
    components: { AppInputGroup, AppBadge },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <app-input-group v-model="value" v-bind="args" placeholder='Add task to "inbox"'>
        <template #prefix>
          <app-badge label="inbox" color="accent" size="xs" />
        </template>
      </app-input-group>
    `,
  }),
};

export const WithSuffix: Story = {
  render: (args) => ({
    components: { AppInputGroup },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <app-input-group v-model="value" v-bind="args" placeholder="Search commands...">
        <template #suffix>
          <span style="color: var(--accent); font-size: var(--font-size-sm); white-space: nowrap;">Today</span>
        </template>
      </app-input-group>
    `,
  }),
};

export const WithPrefixAndSuffix: Story = {
  render: (args) => ({
    components: { AppInputGroup, AppBadge },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <app-input-group v-model="value" v-bind="args" placeholder='Add task to "inbox"'>
        <template #prefix>
          <app-badge label="inbox" color="accent" size="xs" />
        </template>
        <template #suffix>
          <span style="color: var(--accent); font-size: var(--font-size-sm); white-space: nowrap;">Today</span>
        </template>
      </app-input-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    components: { AppInputGroup },
    setup() {
      const value = ref('Some value');
      return { args, value };
    },
    template: `<app-input-group v-model="value" v-bind="args" disabled />`,
  }),
};
