import type { StoryObj } from '@storybook/vue3';
import StoryList from './StoryList.vue';
import { computed } from 'vue';
import AppButton from 'src/components/AppButton.vue';
import type { ViewType } from 'src/models/card-type';

export default {
  component: AppButton,
  title: 'Buttons',
  tags: ['autodocs'],
  args: {},
};

const types: ViewType[] = ['info', 'plain', 'warning', 'danger'];

export const Default: StoryObj<typeof AppButton> = {
  args: {
    type: 'info',
    outline: false,
  },
  render: (args) => ({
    components: { StoryList, AppButton },
    setup() {
      const listItems = computed(() => {
        return types.map((type) => ({
          component: AppButton,
          props: { ...args, type },
          description: type,
          slots: { default: 'Click' },
        }));
      });

      return {
        args,
        listItems,
      };
    },
    template: `<story-list :items="listItems" />`,
  }),
};
