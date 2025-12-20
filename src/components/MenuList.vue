<template>
  <card-wrapper class="context-menu-list">
    <menu-item
      v-for="(item, index) of actions"
      :key="index"
      @click="handleAction(item)"
      :icon="getIcon(item)"
      class="context-menu-item"
      flat
    >
      {{ getLabel(item) }}
    </menu-item>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { toValue } from 'vue';
import type { MenuAction, CommandMenuAction, Command } from 'orgnote-api';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import { useCommandsStore } from 'src/stores/command';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { useNotificationsStore } from 'src/stores/notifications';
import { to } from 'orgnote-api/utils';

const props = defineProps<{
  actions: MenuAction[];
  data?: unknown;
}>();

const emit = defineEmits<{
  close: [];
}>();

const commandsStore = useCommandsStore();
const notifications = useNotificationsStore();

const isCommandAction = (item: MenuAction): item is CommandMenuAction => 'command' in item;

const getCommand = (item: CommandMenuAction): Command | undefined =>
  commandsStore.get(item.command);

const getIcon = (item: MenuAction): string | undefined => {
  if (isCommandAction(item)) {
    const command = getCommand(item);
    const icon = command ? toValue(command.icon) : undefined;
    return typeof icon === 'string' ? icon : undefined;
  }
  return item.icon;
};

const getLabel = (item: MenuAction) => {
  if (isCommandAction(item)) {
    const command = getCommand(item);
    return command ? camelCaseToWords(command.command) : '';
  }
  return item.title;
};

const handleAction = async (item: MenuAction) => {
  emit('close');

  const executeAction = async () => {
    if (isCommandAction(item)) {
      return await commandsStore.execute(item.command, props.data);
    }
    return item.handler(props.data);
  };

  const result = await to(executeAction, 'Failed to execute action')();

  result.mapErr((error) => {
    notifications.notify({
      message: error.message,
      level: 'danger',
    });
  });
};
</script>

<style lang="scss" scoped>
.context-menu-list {
  min-width: 160px;
}
</style>
