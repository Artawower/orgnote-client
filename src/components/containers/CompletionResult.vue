<template>
  <div class="flex column items-start justify-start fit no-wrap">
    <div class="q-px-md full-width">
      <q-input v-model="filter" autofocus borderless>
        <template v-slot:prepend>
          <q-icon name="keyboard_arrow_right" />
        </template>
      </q-input>
    </div>
    <q-list class="flex-1 overflow-auto">
      <q-item
        v-for="(c, i) in filteredCandidates"
        :key="c.command"
        class="flex row completion-item"
        :active="i === selectedIndex"
        :clickable="true"
        @click="executeCommand(c as any)"
      >
        <div class="col-4">
          <q-icon v-if="c.icon" :name="c.icon" class="q-px-md"></q-icon>
          <span class="text-bold">[{{ c.group }}]: </span>
          <span>{{ c.command }}</span>
        </div>
        <div class="col-8">
          <span class="text-italic">{{ c.description }}</span>
        </div>
      </q-item>
    </q-list>
    <div class="completion-footer full-width q-px-lg q-py-sm">
      It's footer. Describe keybindings here
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount } from 'vue';
import { useCommandExecutor } from 'src/hooks';
import { useKeybindingStore } from 'src/stores/keybindings';
import { storeToRefs } from 'pinia';
import { useCompletionStore } from 'src/stores';

const completionStore = useCompletionStore();
const { filteredCandidates, filter, selectedIndex } =
  storeToRefs(completionStore);

const commandExecutor = useCommandExecutor();
const { executeCommand } = useKeybindingStore();

onBeforeMount(() => commandExecutor.registerDynamicCommands());

onBeforeUnmount(() => commandExecutor.unregisterDynamicCommands());
</script>

<style lang="scss" setup>
.completion-footer {
  background: var(--red);
}
</style>
