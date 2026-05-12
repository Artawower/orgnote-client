<template>
  <app-flex class="task-row" row between align-start gap="md">
    <app-flex gap="sm" align-start class="task-main">
      <app-checkbox
        :model-value="task.state === 'done'"
        :style="priorityStyle"
        @change="$emit('toggle')"
        @click.stop
      />
      <app-flex column gap="xs" align-start class="task-body">
        <span class="task-title" :class="{ done: task.state === 'done' }">{{ task.text }}</span>
        <app-flex v-if="hasMeta" row start align-center gap="xs" wrap>
          <span v-if="dateLabel" class="task-date" :class="{ overdue: isTaskOverdue }">
            <app-icon name="sym_o_event" size="xs" />
            {{ dateLabel }}
          </span>
          <org-tags v-if="task.tags?.length" :tags="task.tags" :clickable="false" badge-size="xs" />
        </app-flex>
      </app-flex>
    </app-flex>
    <action-button
      icon="sym_o_open_in_new"
      size="sm"
      color="fg-muted"
      @click.stop="$emit('open-note')"
    />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
import AppCheckbox from 'src/components/AppCheckbox.vue';
import AppIcon from 'src/components/AppIcon.vue';
import ActionButton from 'src/components/ActionButton.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import type { FileTask } from 'orgnote-api';
import { computed } from 'vue';
import { isOverdue } from '../utils/agenda-filters';
import { useAgendaDate } from '../composables/use-agenda-date';

const PRIORITY_COLORS: Record<string, string> = {
  A: 'var(--red, var(--q-negative))',
  B: 'var(--yellow, var(--q-warning))',
  C: 'var(--blue, var(--q-info))',
};

const props = defineProps<{ task: FileTask }>();
defineEmits<{ toggle: []; 'open-note': [] }>();

const priorityStyle = computed(() => {
  const color = props.task.priority ? PRIORITY_COLORS[props.task.priority] : undefined;
  return color ? { '--checkbox-color': color } : undefined;
});

const { prettyAgendaDate } = useAgendaDate();

const isTaskOverdue = computed(() => isOverdue(props.task));

const rawDate = computed(() => props.task.scheduled?.date ?? props.task.deadline?.date ?? null);

const dateLabel = computed(() => (rawDate.value ? prettyAgendaDate(rawDate.value) : null));

const hasMeta = computed(() => !!dateLabel.value || !!props.task.tags?.length);
</script>

<style lang="scss" scoped>
.task-row {
  padding: var(--menu-item-padding);
  min-height: var(--menu-item-height);
  border-bottom: var(--border-default);

  @include hover {
    background-color: var(--menu-item-hover-bg);
    border-radius: var(--radius-sm);
  }

  &:last-child {
    border-bottom: none;
  }
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-body {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: var(--font-size-sm);
  color: var(--fg);
  line-height: var(--line-height-sm);
  word-break: break-word;

  &.done {
    text-decoration: line-through;
    color: var(--fg-muted);
  }
}

.task-date {
  display: inline-flex;
  align-items: center;
  gap: var(--gap-xs);
  font-size: var(--font-size-xs);
  color: var(--fg-muted);

  &.overdue {
    color: var(--red, var(--q-negative));
  }
}
</style>
