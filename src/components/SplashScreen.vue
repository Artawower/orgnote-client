<template>
  <div class="splash-screen">
    <div class="content">
      <div class="image-container">
        <img alt="orgnote icon" src="images/modern-unicorn-round.png" />
        <div class="gloss"></div>
      </div>
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

  .content {
    @include flexify(column, center, center);
    margin-top: 98px;
  }
}

.image-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  width: 40%;
  height: 40%;
  border-radius: 50%;
}

.image-container img {
  display: inline-block;
  width: 100%;
  height: auto;
}

.gloss {
  position: absolute;
  top: -150%;
  left: -100%;
  width: 200%;
  height: 200%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
  transform: rotate(-30deg);
  animation: gloss-animation 2s infinite;
}

@keyframes gloss-animation {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(-30deg);
  }
  50% {
    transform: translateX(25%) translateY(25%) rotate(-30deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(-30deg);
  }
}

.q-linear-progress {
  width: 40%;
}
</style>
