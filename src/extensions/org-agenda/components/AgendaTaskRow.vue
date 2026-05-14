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
        <relative-date-label v-if="rawDate" :date="rawDate" />
        <app-icon
          name="sym_o_open_in_new"
          size="sm"
          color="fg-muted"
          class="task-open"
          @click.stop="$emit('open-note')"
        />
      </app-flex>
    </template>
  </menu-item>
</template>

<script lang="ts" setup>
import { parseISO } from 'date-fns';
import MenuItem from 'src/containers/MenuItem.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppCheckbox from 'src/components/AppCheckbox.vue';
import AppIcon from 'src/components/AppIcon.vue';
import RelativeDateLabel from 'src/components/RelativeDateLabel.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import { computed } from 'vue';
import { isCompletedOn } from '../utils/agenda-filters';

const props = defineProps<{ task: AgendaTaskView }>();
const emit = defineEmits<{ toggle: []; 'open-note': [] }>();

const onCheckboxChange = (): void => {
  emit('toggle');
};

const priorityClass = computed(() =>
  props.task.priority ? `priority-${props.task.priority.toLowerCase()}` : '',
);

const isChecked = computed(
  () => props.task.state === 'done' || isCompletedOn(props.task, props.task.viewDate),
);

const rawDate = computed(() => {
  const raw = props.task.scheduled?.date ?? props.task.deadline?.date;
  return raw ? parseISO(raw) : null;
});
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

.task-open {
  color: var(--fg-muted);
  cursor: pointer;

  @include hover {
    color: var(--fg);
  }
}
</style>
