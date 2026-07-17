import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AppBadge from 'src/components/AppBadge.vue';
import AppFlex from 'src/components/AppFlex.vue';
import DateRangePickerModal from 'src/components/DateRangePickerModal.vue';
import type { DateRange } from 'src/models/date-picker';

interface DateRangePickerModalStoryArgs {
  from: string;
  to: string;
}

const meta = {
  title: 'Forms/DateRangePickerModal',
  component: DateRangePickerModal,
  tags: ['autodocs'],
  args: {
    from: '2026-05-14',
    to: '2026-05-14',
  },
} as Meta<DateRangePickerModalStoryArgs>;

export default meta;

type Story = StoryObj<DateRangePickerModalStoryArgs>;

const renderPicker: Story['render'] = (args) => ({
  components: { AppBadge, AppFlex, DateRangePickerModal },
  setup() {
    const lastAction = ref('None');
    const onApply = (range: DateRange): void => {
      lastAction.value = `Apply ${range.from} – ${range.to}`;
    };
    const onClear = (): void => {
      lastAction.value = 'Clear';
    };
    const onCancel = (): void => {
      lastAction.value = 'Cancel';
    };
    return { args, lastAction, onApply, onClear, onCancel };
  },
  template: `
    <app-flex column align-start gap="md" style="max-width: 360px;">
      <app-badge :label="lastAction" color="accent" />
      <date-range-picker-modal
        v-bind="args"
        @apply="onApply"
        @clear="onClear"
        @cancel="onCancel"
      />
    </app-flex>
  `,
});

export const SingleDay: Story = {
  render: renderPicker,
};

export const Range: Story = {
  args: {
    from: '2026-05-14',
    to: '2026-05-18',
  },
  render: renderPicker,
};
