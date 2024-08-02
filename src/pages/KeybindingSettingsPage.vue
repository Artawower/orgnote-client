<template>
  <navigation-page>
    <menu-group
      v-for="g of keybindingsMenuGgroups"
      v-bind:key="g.title"
      v-bind="g"
    >
      <template #label="{ data }">
        <i>{{ (data as Command).description ?? (data as Command).command }}</i>
      </template>
    </menu-group>
  </navigation-page>
</template>

<script lang="ts" setup>
import { Command } from 'orgnote-api';
import MenuGroup, { MenuGroupProps } from 'src/components/ui/MenuGroup.vue';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import { useKeybindingStore } from 'src/stores/keybindings';

const keybindingStore = useKeybindingStore();

const buildKeybindingsMenuItems = (
  cmds: Command<unknown>[]
): MenuItemProps[] => {
  return cmds.map((c) => ({
    info: c.command,
    value:
      c.keySequence instanceof Array ? c.keySequence.join(' ') : c.keySequence,
    type: 'text',
    data: c,
  }));
};

const keybindingsMenuGgroups: MenuGroupProps[] = Object.keys(
  keybindingStore.groupedKeybindings
).reduce((acc, group) => {
  const keybindings = keybindingStore.groupedKeybindings[group];
  const menuGroup: MenuGroupProps = {
    title: group,
    items: buildKeybindingsMenuItems(keybindings),
  };
  acc.push(menuGroup);
  return acc;
}, []);
</script>
