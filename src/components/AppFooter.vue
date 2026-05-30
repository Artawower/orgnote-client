<template>
  <div
    class="footer-wrapper"
    :class="{ float, 'open-top': openTop, 'open-bottom': openBottom }"
  >
    <div
      class="footer"
      :class="{ 'open-top': openTop, 'open-bottom': openBottom }"
      :style="{ justifyContent: justifyMap[props.justify ?? 'center'] }"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const justifyMap: Record<string, string> = {
  center: 'center',
  between: 'space-between',
  start: 'flex-start',
  end: 'flex-end',
  around: 'space-around',
  evenly: 'space-evenly',
};

const props = withDefaults(
  defineProps<{
    justify?: keyof typeof justifyMap;
    float?: boolean;
    openTop?: boolean;
    openBottom?: boolean;
  }>(),
  {
    justify: 'center',
  },
);
</script>

<style lang="scss" scoped>
.footer-wrapper {
  width: 100%;
  background: transparent;
}

.float {
  padding: var(--footer-wrapper-padding);

  &.open-top {
    padding-top: 0;
  }

  &.open-bottom {
    padding-bottom: 0;
  }
}

.footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: var(--footer-height);
  background: var(--footer-bg);
  border: var(--footer-border);
  border-top: var(--footer-border-top, var(--glass-border-top));
  padding: var(--footer-padding);
  border-radius: var(--footer-border-radius);
  box-sizing: border-box;
  -webkit-backdrop-filter: var(--footer-backdrop-filter);
  backdrop-filter: var(--footer-backdrop-filter);
  background-clip: padding-box;
  box-shadow: var(--footer-box-shadow);

  &.open-top {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
    box-shadow: none;
  }

  &.open-bottom {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  }

  --btn-action-radius: calc(var(--footer-border-radius) - var(--padding-md));
  @include glass-btn;
  @include glass-specular;
}
</style>
