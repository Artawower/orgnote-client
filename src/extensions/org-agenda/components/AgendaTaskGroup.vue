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
        @toggle="$emit('task-toggle', task, group.filePath)"
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
import type { FileTask } from 'orgnote-api';
import type { AgendaTaskGroup } from '../composables/use-agenda-tasks';

defineProps<{ group: AgendaTaskGroup }>();
defineEmits<{
  'task-click': [task: FileTask, filePath: string];
  'task-toggle': [task: FileTask, filePath: string];
}>();
</script>
