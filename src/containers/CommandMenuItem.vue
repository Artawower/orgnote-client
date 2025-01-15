<template>
  <menu-item
    @click="execute(props.command)"
    :icon="extractDynamicValue(command.icon)"
    :active="command?.isActive?.()"
    :narrow="command?.context?.narrow"
  >
    <div class="capitalize text-bold">{{ t(command.command) }}</div>
  </menu-item>
</template>

<script lang="ts" setup>
import type { CommandName } from 'orgnote-api';
import { api } from 'src/boot/api';
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';
import { extractDynamicValue } from 'src/utils/extract-dynamic-value';
const props = defineProps<{
  command: CommandName;
}>();

const { get, execute } = api.core.useCommands();

const command = get(props.command);

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
