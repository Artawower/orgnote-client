<template>
  <div class="task-row" @click="$emit('open-note')">
    <app-checkbox
      :model-value="isChecked"
      :style="priorityStyle"
      @change="onCheckboxChange"
      @click.stop
    />
    <span class="task-title" :class="{ done: isChecked }">{{ task.text }}</span>
    <app-flex row align-center gap="xs" class="task-meta" @click.stop>
      <org-tags v-if="task.tags?.length" :tags="task.tags" badge-size="xs" :clickable="false" />
      <span v-if="dateLabel" class="task-date" :class="{ overdue: isTaskOverdue }">
        {{ dateLabel }}
      </span>
      <app-icon name="sym_o_open_in_new" size="md" class="task-open" @click="$emit('open-note')" />
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
import AppCheckbox from 'src/components/AppCheckbox.vue';
import AppIcon from 'src/components/AppIcon.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import { logger } from 'src/boot/logger';
import { computed } from 'vue';
import { isCompletedOn, isOverdue } from '../utils/agenda-filters';
import { useAgendaDate } from '../composables/use-agenda-date';

const PRIORITY_COLORS: Record<string, string> = {
  A: 'var(--red, var(--q-negative))',
  B: 'var(--yellow, var(--q-warning))',
  C: 'var(--blue, var(--q-info))',
};

const props = defineProps<{ task: AgendaTaskView }>();
const emit = defineEmits<{ toggle: []; 'open-note': [] }>();

const onCheckboxChange = (): void => {
  logger.info('[agenda] AgendaTaskRow: checkbox changed', {
    taskStart: props.task.start,
    taskState: props.task.state,
    taskText: props.task.text,
  });
  emit('toggle');
};

const priorityStyle = computed(() => {
  const color = props.task.priority ? PRIORITY_COLORS[props.task.priority] : undefined;
  return color ? { '--checkbox-color': color } : undefined;
});

const { prettyAgendaDate } = useAgendaDate();

const isTaskOverdue = computed(() => isOverdue(props.task));

const isChecked = computed(
  () => props.task.state === 'done' || isCompletedOn(props.task, props.task.viewDate),
);

const rawDate = computed(() => props.task.scheduled?.date ?? props.task.deadline?.date ?? null);

const dateLabel = computed(() => (rawDate.value ? prettyAgendaDate(rawDate.value) : null));
</script>

<style lang="scss" scoped>
.task-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--menu-item-padding);
  min-height: var(--menu-item-height);
  cursor: pointer;
  border-bottom: var(--border-default);

  @include hover {
    background-color: var(--menu-item-hover-bg);
  }

  &:last-child {
    border-bottom: none;
  }
}

.task-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--font-size-sm);
  color: var(--fg);

  &.done {
    text-decoration: line-through;
    color: var(--fg-muted);
  }
}

.task-meta {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  color: var(--fg-muted);
}

.task-date {
  white-space: nowrap;

  &.overdue {
    color: var(--red, var(--q-negative));
  }
}

.task-open {
  color: var(--fg-muted);
  cursor: pointer;

  @include hover {
    color: var(--fg);
  }
}
</style>
