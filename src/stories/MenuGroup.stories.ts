import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MenuGroup from 'src/components/MenuGroup.vue';
import MenuItem from 'src/containers/MenuItem.vue';

type MenuGroupStoryArgs = {
  title?: string;
};

const meta: Meta<MenuGroupStoryArgs> = {
  component: MenuGroup,
  title: 'Menu group',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<MenuGroupStoryArgs>;

export const Default: Story = {
  args: {
    title: 'Workspace',
  },
  render: (args) => ({
    components: { MenuGroup, MenuItem },
    setup: () => ({ args }),
    template: `
      <menu-group v-bind="args" style="width: 320px">
        <menu-item>Files</menu-item>
        <menu-item active>Search</menu-item>
        <menu-item>Bookmarks</menu-item>
      </menu-group>
    `,
  }),
};

export const WithoutTitle: Story = {
  render: () => ({
    components: { MenuGroup, MenuItem },
    template: `
      <menu-group style="width: 320px">
        <menu-item>Copy</menu-item>
        <menu-item>Paste</menu-item>
      </menu-group>
    `,
  }),
};
