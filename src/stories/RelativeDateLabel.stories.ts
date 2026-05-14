import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { addDays, subDays } from 'date-fns';
import RelativeDateLabel from 'src/components/RelativeDateLabel.vue';
import StoryList from './StoryList.vue';
import { computed } from 'vue';

interface RelativeDateLabelStoryArgs {
  date: Date;
  tone?: 'overdue' | 'today' | 'tomorrow' | 'future' | 'past';
  dateFormat?: string;
}

const meta = {
  component: RelativeDateLabel,
  title: 'Relative Date Label',
  tags: ['autodocs'],
  args: {
    date: new Date(),
    dateFormat: 'M/d/yyyy',
  },
  argTypes: {
    date: { control: 'date' },
    tone: {
      control: 'select',
      options: ['overdue', 'today', 'tomorrow', 'future', 'past'],
    },
  },
} as Meta<RelativeDateLabelStoryArgs>;

export default meta;

type Story = StoryObj<RelativeDateLabelStoryArgs>;

export const Default: Story = {
  render: (args) => ({
    components: { RelativeDateLabel },
    setup() {
      return { args };
    },
    template: '<relative-date-label v-bind="args" />',
  }),
};

export const Tones: Story = {
  render: (args) => ({
    components: { StoryList, RelativeDateLabel },
    setup() {
      const today = new Date();
      const items = computed(() => [
        {
          component: RelativeDateLabel,
          props: { ...args, date: subDays(today, 2), tone: 'overdue' },
          description: 'overdue',
        },
        {
          component: RelativeDateLabel,
          props: { ...args, date: today, tone: 'today' },
          description: 'today',
        },
        {
          component: RelativeDateLabel,
          props: { ...args, date: addDays(today, 1), tone: 'tomorrow' },
          description: 'tomorrow',
        },
        {
          component: RelativeDateLabel,
          props: { ...args, date: addDays(today, 5), tone: 'future' },
          description: 'future',
        },
        {
          component: RelativeDateLabel,
          props: { ...args, date: subDays(today, 1), tone: 'past' },
          description: 'past',
        },
      ]);
      return { items };
    },
    template: '<story-list :items="items" />',
  }),
};
