<template>
  <q-header>
    <q-bar v-if="$q.platform.is.electron" class="q-electron-drag bg-alt">
      <q-btn
        @click="close"
        dense
        flat
        round
        icon="lens"
        size="8.5px"
        color="red"
      />
      <q-btn
        @click="minimize"
        dense
        flat
        round
        icon="lens"
        size="8.5px"
        color="yellow"
      />
      <q-btn
        @click="toggleMaximize"
        dense
        flat
        round
        icon="lens"
        size="8.5px"
        color="green"
      />
    </q-bar>
  </q-header>
</template>

<script lang="ts" setup>
const { close, minimize, toggleMaximize } =
  (process.env.CLIENT && window.electron) ?? {};
</script>
