<template>
  <template v-if="opened">
    <Teleport to="#mini-buffer">
      <div class="q-px-md">
        <q-input v-model="filter" autofocus borderless>
          <template v-slot:prepend>
            <q-icon name="keyboard_arrow_right" />
          </template>
        </q-input>
      </div>
      <q-list>
        <q-item
          v-for="(c, i) in filteredCandidates"
          :key="c.command"
          class="flex row completion-item"
          :active="i === selectedCandidateIndex"
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
    </Teleport>
  </template>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCompletionStore } from 'src/stores';
const completionStore = useCompletionStore();

const { filteredCandidates, opened, filter, selectedCandidateIndex } =
  storeToRefs(completionStore);
</script>

<style lang="scss">
.completion-item {
  min-height: var(--completion-item-min-height);
  padding: var(--completion-item-padding);
}
</style>
