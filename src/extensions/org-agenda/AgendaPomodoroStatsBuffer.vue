<template>
  <app-buffer-content constrained>
    <container-layout :body-scroll="true" gap="sm">
      <template #body>
        <app-flex column start align-stretch gap="sm" class="stats-body">
          <agenda-pomodoro-overview />
          <agenda-focus-record />
        </app-flex>
      </template>
    </container-layout>
  </app-buffer-content>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import AppBufferContent from 'src/components/AppBufferContent.vue';
import AppFlex from 'src/components/AppFlex.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import AgendaPomodoroOverview from './components/AgendaPomodoroOverview.vue';
import AgendaFocusRecord from './components/AgendaFocusRecord.vue';
import { useAgendaTasksStore } from './stores/agenda-tasks-store';

const tasksStore = useAgendaTasksStore();
onMounted(() => tasksStore.loadFiles());
</script>

<style lang="scss" scoped>
.stats-body {
  padding: var(--gap-sm);
}
</style>
