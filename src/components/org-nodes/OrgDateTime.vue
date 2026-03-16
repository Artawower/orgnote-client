<template>
  <app-date
    v-if="resolvedDate"
    class="org-date"
    :class="{ active: !isInactiveTimestamp, inactive: isInactiveTimestamp, expired }"
    :date="resolvedDate"
    :label="currentNode.rawValue"
    focus-tone="current"
    format="date"
    :editable="!readonly"
    @open="handleOpenPicker"
  />
  <inline-date-token v-else class="org-date" :class="{ expired }">
    {{ currentNode.rawValue }}
  </inline-date-token>
</template>

<script lang="ts" setup>
import type { OrgNode } from 'org-mode-ast';
import { computed } from 'vue';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { logger } from 'src/boot/logger';
import AppDate from 'src/components/AppDate.vue';
import InlineDateToken from 'src/components/InlineDateToken.vue';
import { formatCalendarDate, parseOrgDate, updateOrgDateCalendar } from 'src/utils/org-date';

const props = defineProps<{
  node: OrgNode;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const currentNode = computed(() => props.node);
const parsedDate = computed(() => parseOrgDate(currentNode.value.rawValue));
const resolvedDate = computed(() => parsedDate.value?.date);
const isInactiveTimestamp = computed(() => parsedDate.value?.openingBracket === '[');
const expired = computed(() => {
  if (!parsedDate.value || isInactiveTimestamp.value) {
    return false;
  }

  return new Date() > parsedDate.value.comparisonDate;
});

const handleSelect = (calendarDate: string): void => {
  const nextValue = updateOrgDateCalendar(currentNode.value.rawValue, calendarDate);
  if (!nextValue) {
    return;
  }

  emit('update', nextValue);
};

const handleOpenPicker = async (): Promise<void> => {
  if (props.readonly || !resolvedDate.value) {
    return;
  }

  const initialDate = formatCalendarDate(resolvedDate.value);
  const result = await to(async () => {
    const { default: DatePickerModal } = await import('src/components/DatePickerModal.vue');
    return await api.ui.useModal().open<string>(DatePickerModal, {
      mini: true,
      modalProps: {
        initialDate,
      },
    });
  }, 'Failed to open org date picker')();

  if (result.isErr()) {
    logger.error('Failed to open org date picker', {
      error: result.error.message,
    });
    return;
  }

  if (!result.value) {
    return;
  }

  handleSelect(result.value);
};
</script>

<style lang="scss" scoped>
.org-date {
  color: var(--fg-muted);
  font-weight: 500;

  &.active {
    color: var(--yellow);
  }

  &.inactive {
    color: var(--fg-muted);
  }

  &.expired {
    color: var(--red);
  }
}
</style>
