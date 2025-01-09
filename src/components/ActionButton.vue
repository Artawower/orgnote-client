<template>
  <button>
    <q-icon :name="icon" />
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string;
}>();
</script>
