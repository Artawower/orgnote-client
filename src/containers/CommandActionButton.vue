<template>
  <action-button
    v-if="command && !command.hide?.(api)"
    v-bind="$attrs"
    @click="execute"
    :icon="iconString"
    :aria-label="resolvedAriaLabel"
  >
    <template v-if="iconComponent" #icon>
      <component :is="iconComponent" />
    </template>
    <template v-if="includeText || text" #text>{{
      text || camelCaseToWords(command.command)
    }}</template>
  </action-button>
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';
import type { CommandName } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { computed, toValue } from 'vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { useResolvedIcon } from 'src/composables/use-resolved-icon';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  command: CommandName;
  includeText?: boolean;
  text?: string;
  ariaLabel?: string;
  data?: unknown;
}>();

const commandsStore = useCommandsStore();

const command = computed(() => commandsStore.get(props.command));

const { iconString, iconComponent } = useResolvedIcon(computed(() => toValue(command.value?.icon)));

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  if (props.text) return props.text;
  if (!command.value) return undefined;
  return camelCaseToWords(command.value.command);
});

const execute = () => {
  commandsStore.execute(props.command, props.data);
};
</script>
