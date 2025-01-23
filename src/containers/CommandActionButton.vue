<template>
  <action-button
    @click="execute"
    v-if="command"
    :icon="extractDynamicValue(command.icon)"
    :size="size"
  />
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';
import type { CommandName } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { computed } from 'vue';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';
import type { IconSize } from 'src/models/icon-size';

const props = withDefaults(
  defineProps<{
    command: CommandName;
    size?: IconSize;
  }>(),
  {
    size: 'md',
  },
);

const commandsStore = useCommandsStore();

const command = computed(() => commandsStore.get(props.command));

const execute = () => {
  commandsStore.execute(props.command);
};
</script>
