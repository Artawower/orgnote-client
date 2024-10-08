<template>
  <q-item
    :key="item.command"
    class="completion-item"
    :class="{ selected }"
    :clickable="true"
    @mousedown="completionStore.executeCandidate(item)"
    @mouseover="(e: MouseEvent) => focusCompletionCandidate(e, index)"
  >
    <!-- TODO: master combine with src/components/ui/SearchContainer.vue search icon as -->
    <!-- universal icon component with border (inherit props from quasar icon) -->
    <div class="icon">
      <q-icon
        v-if="item.icon"
        :name="extractDynamicValue(item.icon)"
        size="sm"
      ></q-icon>
    </div>
    <div class="text-bold flex flex-start no-wrap gap-4 color-main">
      <div v-if="config.completion.showGroup">[{{ item.group }}]:&nbsp</div>
      <div class="line-limit-1">
        <div class="capitalize">
          {{ extractDynamicValue(item.title) || item.command }}
        </div>
      </div>
    </div>
    <div>
      <span class="text-italic color-secondary line-limit-1">
        {{ extractDynamicValue(item.description) }}
      </span>
    </div>
  </q-item>
</template>

<script lang="ts" setup>
import { CompletionCandidate } from 'src/api';
import { useCompletionStore } from 'src/stores/completion';
import { useSettingsStore } from 'src/stores/settings';
import { extractDynamicValue } from 'src/tools';

defineProps<{
  item: CompletionCandidate;
  selected?: boolean;
  index: number;
}>();

const completionStore = useCompletionStore();
const { config } = useSettingsStore();

let lastCoords = [0, 0];
const focusCompletionCandidate = (e: MouseEvent, index: number) => {
  const coordsChanged =
    lastCoords[0] !== e.clientX || lastCoords[1] !== e.clientY;

  if (!coordsChanged) {
    return;
  }
  lastCoords = [e.clientX, e.clientY];
  completionStore.focusCandidate(index);
};
</script>
