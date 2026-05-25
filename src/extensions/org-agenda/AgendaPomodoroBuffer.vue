<template>
  <app-buffer-content>
    <agenda-pomodoro-timer />
    <command-action-button :command="AGENDA_POMODORO_STATS_COMMAND" size="md" class="stats-btn" />
  </app-buffer-content>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import AppBufferContent from 'src/components/AppBufferContent.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import AgendaPomodoroTimer from './components/AgendaPomodoroTimer.vue';
import { usePomodoroStore } from './stores/pomodoro-store';
import { useAgendaTasksStore } from './stores/agenda-tasks-store';
import { AGENDA_POMODORO_STATS_COMMAND } from './constants';

const pomodoroStore = usePomodoroStore();
const tasksStore = useAgendaTasksStore();

onMounted(async () => {
  await tasksStore.loadFiles();
  await pomodoroStore.restoreSession();
});
</script>

<style lang="scss" scoped>
.stats-btn {
  position: absolute;
  top: var(--gap-md);
  right: var(--gap-md);
}
</style>
