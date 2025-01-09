<template>
  <action-button v-if="command" :icon="extractDynamicValue(command.icon)" />
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';
import type { CommandName } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { computed } from 'vue';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';

const props = defineProps<{
  command: CommandName;
}>();

const commandsStore = useCommandsStore();

const command = computed(() => commandsStore.get(props.command));
</script>
