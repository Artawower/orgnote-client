import type { StoryObj } from '@storybook/vue3';
import ActionButton from 'src/components/ActionButton.vue';
import AppIcon from 'src/components/AppIcon.vue';
import StoryList from './StoryList.vue';
import { computed } from 'vue';

export default {
  component: ActionButton,
  title: 'Action Button',
  tags: ['autodocs'],
  args: {},
};

const sizes = ['xs', 'sm', 'md', 'lg'];

export const Default: StoryObj<typeof ActionButton> = {
  args: {
    icon: 'folder',
    active: true,
    color: 'fg-alt',
    hoverColor: 'red',
    outline: false,
  },
  render: (args) => ({
    components: { StoryList, ActionButton, AppIcon },
    setup() {
      const listItems = computed(() => {
        return sizes.map((size) => ({
          component: ActionButton,
          props: { ...args, size },
          description: size,
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

export const WithFireIcon: StoryObj<typeof ActionButton> = {
  args: {
    icon: 'sym_o_expand_content',
    fireIcon: 'sym_o_collapse_content',
    fireColor: 'red',
  },
  render: (args) => ({
    components: { StoryList, ActionButton, AppIcon },
    setup() {
      const listItems = computed(() => {
        return sizes.map((size) => ({
          component: ActionButton,
          props: { ...args, size },
          description: size,
        }));
      });
      return { args, listItems };
    },
    template: `<story-list :items="listItems" />`,
  }),
};

export const WithText: StoryObj<typeof ActionButton> = {
  args: {
    icon: 'sym_o_expand_content',
    fireIcon: 'sym_o_collapse_content',
    fireColor: 'red',
  },
  render: (args) => ({
    components: { StoryList, ActionButton, AppIcon },
    setup() {
      const listItems = computed(() => {
        return sizes.map((size, i) => ({
          component: ActionButton,
          props: { ...args, size },
          description: size,
          slots: { text: `Text ${i}` },
        }));
      });
      return { args, listItems };
    },
    template: `<story-list :items="listItems" />`,
  }),
};
