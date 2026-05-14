<template>
  <app-spoiler flat max-height="none" default-expanded>
    <template #title>
      <app-flex row between align-center gap="sm">
        <app-title :level="5" no-margin>{{ group.fileTitle }}</app-title>
        <app-badge :label="String(group.tasks.length)" size="xs" />
      </app-flex>
    </template>
    <template #body>
      <agenda-task-row
        v-for="task in group.tasks"
        :key="task.id"
        :task="task"
        @toggle="onTaskToggle(task)"
        @open-note="$emit('task-click', task, group.filePath)"
      />
    </template>
  </app-spoiler>
</template>

<script lang="ts" setup>
import AppSpoiler from 'src/components/AppSpoiler.vue';
import AppTitle from 'src/components/AppTitle.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppBadge from 'src/components/AppBadge.vue';
import AgendaTaskRow from './AgendaTaskRow.vue';
import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import { logger } from 'src/boot/logger';
import type { AgendaTaskGroup } from '../composables/use-agenda-tasks';

const props = defineProps<{ group: AgendaTaskGroup }>();
const emit = defineEmits<{
  'task-click': [task: AgendaTaskView, filePath: string];
  'task-toggle': [task: AgendaTaskView, filePath: string];
}>();

const onTaskToggle = (task: AgendaTaskView): void => {
  logger.info('[agenda] AgendaTaskGroup: forwarding task-toggle', {
    taskStart: task.start,
    taskState: task.state,
    taskText: task.text,
    filePath: props.group.filePath,
  });
  emit('task-toggle', task, props.group.filePath);
};
</script>
