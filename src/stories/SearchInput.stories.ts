import type { StoryObj } from '@storybook/vue3-vite';
import StoryList from './StoryList.vue';
import SearchInput from 'src/components/SearchInput.vue';
import ActionButton from 'src/components/ActionButton.vue';
import { computed } from 'vue';

export default {
  component: SearchInput,
  title: 'Search input',
  tags: ['autodocs'],
  args: {},
};

export const Default: StoryObj<typeof SearchInput> = {
  args: {
    placeholder: 'Search...',
    clearable: true,
    size: 'sm',
  },
  render: (args) => ({
    components: { SearchInput },
    setup() {
      return { args };
    },
    template: `<search-input v-bind="args" />`,
  }),
};

export const WithIcon: StoryObj<typeof SearchInput> = {
  args: {
    placeholder: 'Search...',
    icon: 'search',
    clearable: true,
    size: 'sm',
  },
  render: (args) => ({
    components: { SearchInput },
    setup() {
      return { args };
    },
    template: `<search-input v-bind="args" />`,
  }),
};

export const GlassAppearance: StoryObj<typeof SearchInput> = {
  args: {
    placeholder: 'Search...',
    icon: 'search',
    appearance: 'glass',
    clearable: true,
  },
  render: (args) => ({
    components: { SearchInput },
    setup() {
      return { args };
    },
    template: `
      <div style="padding: 24px; background: var(--bg-secondary);">
        <search-input v-bind="args" />
      </div>
    `,
  }),
};

export const Appearances: StoryObj<typeof SearchInput> = {
  render: () => ({
    components: { StoryList, SearchInput },
    setup() {
      const appearances = ['flat', 'glass'] as const;
      const listItems = computed(() =>
        appearances.map((appearance) => ({
          component: SearchInput,
          props: { placeholder: `${appearance} appearance`, icon: 'search', appearance },
          description: appearance,
        })),
      );
      return { listItems };
    },
    template: `
      <div style="padding: 24px; background: var(--bg-secondary);">
        <story-list :items="listItems" />
      </div>
    `,
  }),
};

export const WithActions: StoryObj<typeof SearchInput> = {
  args: {
    placeholder: 'Type command...',
    icon: 'keyboard_arrow_right',
    clearable: false,
  },
  render: (args) => ({
    components: { SearchInput, ActionButton },
    setup() {
      return { args };
    },
    template: `
      <search-input v-bind="args">
        <template #actions>
          <action-button icon="open_in_full" size="sm" />
          <action-button icon="close" size="md" />
        </template>
      </search-input>
    `,
  }),
};
