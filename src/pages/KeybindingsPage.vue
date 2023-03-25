<template>
  <q-page>
    <template
      v-for="(keybindingsList, groupName) in keybindingStore.groupedKeybindings"
      :key="groupName"
    >
      <div class="text-uppercase text-bold">{{ groupName }}</div>
      <q-list class="">
        <q-item v-for="k in keybindingsList" :key="k.command" class="flex row">
          <q-item-section>
            <q-item-label
              >{{ k.command }}
              <span class="text-bold text-italic"
                >({{ k.keySequence }})</span
              ></q-item-label
            >
          </q-item-section>
          <q-item-section class="text-italic">
            {{ k.description }}
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import { useKeybindingStore } from 'src/stores/keybindings';

const keybindingStore = useKeybindingStore();
</script>
