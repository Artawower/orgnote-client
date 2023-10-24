<template>
  <div class="not-found-wrapper text-center q-pa-md flex flex-center">
    <div id="main">
      <div class="fof">
        <h1 class="text-h1 color-main">{{ $t('Error') }} 404</h1>
        <h5
          class="text-h5 cursor-pointer color-main"
          role="link"
          @click="goBack"
        >
          {{ $t('Go back') }}
        </h5>
        <a
          href="mailto:artawower33@gmail.com"
          target="_blank"
          class="text-h6 color-main reset"
          >{{ $t('If you think this is a mistake, please contact us') }}</a
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'ErrorNotFound' };
</script>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';

const router = useRouter();
const prevRouteExist = router.options.history.state.back;

const goBack = prevRouteExist
  ? () => router.go(-1)
  : () => router.push({ name: RouteNames.Home });
</script>

<style lang="scss" scoped>
.not-found-wrapper {
  height: calc(100svh - var(--top-bar-height));
}
* {
  transition: all 0.6s;
}

#main {
  display: table;
  width: 100%;
  text-align: center;
}

.fof {
  display: table-cell;
  vertical-align: middle;
}

.fof {
  h1 {
    display: inline-block;
    padding-right: 12px;
    animation: type 0.5s alternate infinite;
  }
}

@keyframes type {
  from {
    box-shadow: inset -3px 0px 0px #888;
  }
  to {
    box-shadow: inset -3px 0px 0px transparent;
  }
}
</style>
