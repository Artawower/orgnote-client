import type { StoryObj } from '@storybook/vue3';
import StoryList from './StoryList.vue';
import ConfirmationModal from 'src/components/ConfirmationModal.vue';
import NavTabs from 'src/components/NavTabs.vue';
import NavTab from 'src/components/NavTab.vue';

export default {
  component: NavTab,
  title: 'Nav tabs',
  tags: ['autodocs'],
  args: {},
};

export const Default: StoryObj<typeof NavTab> = {
  args: {
    closable: true,
    icon: 'sym_o_folder',
    active: false,
  },
  render: (args) => ({
    components: { StoryList, ConfirmationModal, NavTabs, NavTab },
    setup() {
      return { args };
    },
    template: `
    <nav-tabs>
      <nav-tab v-bind="args">Tab 1</nav-tab>
      <nav-tab v-bind="args">Tab 2</nav-tab>
      <nav-tab v-bind="args" :active="true">Tab 3</nav-tab>
    </nav-tabs>`,
  }),
};
