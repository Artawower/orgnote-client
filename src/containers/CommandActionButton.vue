<template>
  <action-button
    v-if="command && !command.hide?.(api)"
    @click="execute"
    :icon="iconString"
    :size="size"
    classes="action-btn"
    :alignment="alignment"
  >
    <template v-if="iconComponent" #icon="{ size: iconSize }">
      <component :is="iconComponent" :size="iconSize" />
    </template>
    <template v-if="includeText || text" #text>{{
      text || camelCaseToWords(command.command)
    }}</template>
  </action-button>
</template>

<script lang="ts" setup>
import ActionButton, { type ButtonAlignment } from 'src/components/ActionButton.vue';
import type { CommandName, StyleSize } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { computed, toValue } from 'vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { useResolvedIcon } from 'src/composables/use-resolved-icon';

const props = withDefaults(
  defineProps<{
    command: CommandName;
    alignment?: ButtonAlignment;
    size?: StyleSize;
    includeText?: boolean;
    text?: string;
    data?: unknown;
  }>(),
  {
    size: 'md',
    alignment: 'center',
  },
);

const commandsStore = useCommandsStore();

const command = computed(() => commandsStore.get(props.command));

const { iconString, iconComponent } = useResolvedIcon(computed(() => toValue(command.value?.icon)));

const execute = () => {
  commandsStore.execute(props.command, props.data);
};
</script>
