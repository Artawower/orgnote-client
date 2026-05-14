<template>
  <menu-item :capitalize="false" :lines="1" @click="$emit('open-note')">
    <app-flex row align-center gap="sm" class="task-content">
      <app-checkbox
        :model-value="isChecked"
        :class="priorityClass"
        @change="onCheckboxChange"
        @click.stop
      />
      <span class="task-title" :class="{ done: isChecked }">{{ task.text }}</span>
    </app-flex>
    <template #right>
      <app-flex row align-center gap="xs" class="task-meta" @click.stop>
        <org-tags v-if="task.tags?.length" :tags="task.tags" badge-size="xs" :clickable="false" />
        <span v-if="dateLabel" class="task-date" :class="{ overdue: isTaskOverdue }">
          {{ dateLabel }}
        </span>
      </app-flex>
    </template>
  </menu-item>
</template>

<script lang="ts" setup>
import MenuItem from 'src/containers/MenuItem.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppCheckbox from 'src/components/AppCheckbox.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import { computed } from 'vue';
import { isCompletedOn, isOverdue } from '../utils/agenda-filters';
import { useAgendaDate } from '../composables/use-agenda-date';

const props = defineProps<{ task: AgendaTaskView }>();
const emit = defineEmits<{ toggle: []; 'open-note': [] }>();

const onCheckboxChange = (): void => {
  emit('toggle');
};

const priorityClass = computed(() =>
  props.task.priority ? `priority-${props.task.priority.toLowerCase()}` : '',
);

const { prettyAgendaDate } = useAgendaDate();

const isTaskOverdue = computed(() => isOverdue(props.task));

const isChecked = computed(
  () => props.task.state === 'done' || isCompletedOn(props.task, props.task.viewDate),
);

const rawDate = computed(() => props.task.scheduled?.date ?? props.task.deadline?.date ?? null);

const dateLabel = computed(() => (rawDate.value ? prettyAgendaDate(rawDate.value) : null));
</script>

<style lang="scss" scoped>
.priority-a {
  --checkbox-color: var(--priority-a);
}

.priority-b {
  --checkbox-color: var(--priority-b);
}

.priority-c {
  --checkbox-color: var(--priority-c);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &.done {
    text-decoration: line-through;
    color: var(--fg-muted);
  }
}

.task-meta {
  @include fontify(var(--font-size-xs), normal, var(--fg-muted));
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
