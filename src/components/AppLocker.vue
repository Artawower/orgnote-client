<template>
  <div v-if="locked" class="locker">
    <loader-spinner />
    <h1>Note encryption...</h1>
    <h5>{{ doneTasksCount }} / {{ totalTasksCount }}</h5>
  </div>
  <slot v-else />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useAppLockerStore } from 'src/stores/app-locker.store';
import LoaderSpinner from 'src/components/LoaderSpinner.vue';

const { locked, doneTasksCount, totalTasksCount } =
  storeToRefs(useAppLockerStore());
</script>

<style lang="scss" scoped>
.locker {
  @include fit;
  @include flexify(column, center, center, var(--gap-md));
}
</style>
