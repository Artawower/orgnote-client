import type { StoryObj } from '@storybook/vue3';
import StoryList from './StoryList.vue';
import SearchInput from 'src/components/SearchInput.vue';

export default {
  component: SearchInput,
  title: 'Search input',
  tags: ['autodocs'],
  args: {},
};

export const Default: StoryObj<typeof SearchInput> = {
  args: {
    name: 'Some name',
    placeholder: 'Some placeholder',
    type: 'string',
    clearable: false,
    size: 'sm',
  },
  render: (args) => ({
    components: { StoryList, SearchInput },
    setup() {
      return { args };
    },
    template: `<search-input v-bind="args" />`,
  }),
};
