<template>
  <menu-item
    v-bind="$attrs"
    @click="executeCommand"
    :icon="resolvedIcon"
    :active="isActive"
    :narrow="isNarrow"
  >
    <slot>
      <div class="capitalize text-bold">{{ command?.command ? t(command.command) : '' }}</div>
    </slot>
    <template v-if="slots.right" #right>
      <slot name="right" />
    </template>
    <template v-if="slots.content" #content>
      <slot name="content" />
    </template>
  </menu-item>
</template>

<script lang="ts" setup>
import { computed, toValue, useSlots } from 'vue';
import type { CommandName } from 'orgnote-api';
import { api } from 'src/boot/api';
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  command: CommandName;
  data?: unknown;
}>();

const slots = useSlots();

const { get, execute } = api.core.useCommands();

const command = get(props.command);

const resolvedIcon = computed(() => {
  const icon = toValue(command?.icon);
  return typeof icon === 'string' ? icon : undefined;
});
const isActive = computed(() => command?.isActive?.(api));
const isNarrow = computed(() => command?.context?.narrow);

const executeCommand = () => {
  execute(props.command, props.data);
};

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
