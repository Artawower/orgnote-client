import AppIcon from '../components/AppIcon.vue';
import type { StoryObj } from '@storybook/vue3';

export default {
  component: AppIcon,
  title: 'Icon',
  tags: ['autodocs'],
  args: {},
};

const sizes = ['xs', 'sm', 'md', 'lg'];

export const Default: StoryObj<typeof AppIcon> = {
  args: {
    name: 'folder',
  },
  render: (args) => ({
    components: { AppIcon },
    setup() {
      return { args };
    },
    template: `
    ${sizes
      .map(
        (size) => `<div class="preview">
    <div>
    <app-icon v-bind="args" size="${size}" />
    </div>
    <div>${size}</div>
    </div>`,
      )
      .join('\n')}
`,
  }),
};
