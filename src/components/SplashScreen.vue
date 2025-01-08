<template>
  <div class="splash-screen">
    <div class="content">
      <img alt="orgnote icon" src="images/modern-unicorn-round.png" width="40%" height="auto" />
      <h5 class="text-capitalize">
        {{ loadingMessages.currentMessage }}
      </h5>
      <linear-progress />
    </div>
  </div>
</template>

<script lang="ts" setup>
import LinearProgress from 'components/LinearProgress.vue';
import { useLoadingMessages } from 'src/composables/use-loading-messages';

const loadingMessages = useLoadingMessages();
</script>

<style lang="scss" scoped>
.splash-screen {
  @include fit();
  @include overscreen;
  @include flexify(row, center, center);
  background-color: var(--violet);
  padding: var(--block-padding-lg);

  h1 {
    text-align: center;
  }

  .content {
    @include flexify(column, center, center);
  }

  .q-linear-progress {
    max-width: 40%;
  }
}
</style>
