<template>
  <action-button
    v-if="command && !command.hide?.(api)"
    v-bind="$attrs"
    @click="handleClick"
    @pointerdown="handlePointerDown"
    :as="actionButtonTag"
    :disable-click-handling="shouldExecuteOnPointerDown"
    :icon="iconString"
    :aria-label="resolvedAriaLabel"
  >
    <template v-if="iconComponent" #icon>
      <component :is="iconComponent" />
    </template>
    <template v-if="includeText || text" #text>{{
      text || camelCaseToWords(command.command)
    }}</template>
    <q-tooltip v-if="resolvedAriaLabel && !shouldExecuteOnPointerDown" :delay="tooltipDelay">{{
      resolvedAriaLabel
    }}</q-tooltip>
  </action-button>
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';
import type { CommandName } from 'orgnote-api';
import { useCommandsStore } from 'src/stores/command';
import { computed, ref, toValue } from 'vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { useResolvedIcon } from 'src/composables/use-resolved-icon';
import { useConfigStore } from 'src/stores/config';
import { storeToRefs } from 'pinia';
import { focusEditor } from 'src/utils/editor-primitives';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  command: CommandName;
  includeText?: boolean;
  text?: string;
  ariaLabel?: string;
  data?: unknown;
  executeOnPointerDown?: boolean;
}>();

const { config } = storeToRefs(useConfigStore());
const tooltipDelay = computed(() => config.value.ui.tooltipDelay);

const commandsStore = useCommandsStore();
const editorStore = api.core.useEditor();

const command = computed(() => commandsStore.get(props.command));

const { iconString, iconComponent } = useResolvedIcon(computed(() => toValue(command.value?.icon)));

const resolvedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  if (props.text) return props.text;
  if (!command.value) return undefined;
  return camelCaseToWords(command.value.command);
});

const emit = defineEmits<{
  executed: [];
}>();

const suppressNextClick = ref(false);
const shouldExecuteOnPointerDown = computed(() => props.executeOnPointerDown === true);
const actionButtonTag = computed(() => (shouldExecuteOnPointerDown.value ? 'div' : 'button'));

const focusActiveEditor = (): void => {
  const editorView = editorStore.activeContext?.editorViewGetter?.();
  if (!editorView) {
    return;
  }

  focusEditor(editorView);
};

const execute = async () => {
  await commandsStore.execute(props.command, props.data);
  emit('executed');
};

const executeFromPress = async (event: PointerEvent): Promise<void> => {
  if (!shouldExecuteOnPointerDown.value) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  focusActiveEditor();

  suppressNextClick.value = true;
  const execution = execute();
  focusActiveEditor();
  await execution;
  focusActiveEditor();
};

const isPrimaryPointer = (event: PointerEvent): boolean => {
  if (!event.isPrimary) {
    return false;
  }

  if (event.pointerType !== 'mouse') {
    return true;
  }

  return event.button === 0;
};

const handlePointerDown = async (event: PointerEvent): Promise<void> => {
  if (!shouldExecuteOnPointerDown.value || !isPrimaryPointer(event)) {
    return;
  }

  await executeFromPress(event);
};

const handleClick = async (event: MouseEvent): Promise<void> => {
  if (shouldExecuteOnPointerDown.value) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (suppressNextClick.value) {
    suppressNextClick.value = false;
    return;
  }

  await execute();
};
</script>
