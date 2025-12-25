<template>
  <component :is="tag" ref="rootRef" class="flex-container" v-bind="$attrs">
    <slot />
  </component>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { type StyleSize, STYLE_SIZES } from 'orgnote-api';

defineOptions({
  inheritAttrs: false,
});

const rootRef = ref<HTMLElement | null>(null);

const props = withDefaults(
  defineProps<{
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    gap?: StyleSize | ({} & string);
    inline?: boolean;
    tag?: string | object;

    // Direction shortcuts
    row?: boolean;
    column?: boolean;
    rowReverse?: boolean;
    columnReverse?: boolean;
    reverse?: boolean;

    // Justify shortcuts
    start?: boolean;
    center?: boolean;
    end?: boolean;
    between?: boolean;
    around?: boolean;
    evenly?: boolean;

    // Align shortcuts (with align- prefix)
    alignStart?: boolean;
    alignCenter?: boolean;
    alignEnd?: boolean;
    alignStretch?: boolean;
    alignBaseline?: boolean;
  }>(),
  {
    direction: 'row',
    justify: 'between',
    align: 'center',
    gap: '0px',
    inline: false,
    tag: 'div',
    row: false,
    column: false,
    rowReverse: false,
    columnReverse: false,
    reverse: false,
    start: false,
    center: false,
    end: false,
    between: false,
    around: false,
    evenly: false,
    alignStart: false,
    alignCenter: false,
    alignEnd: false,
    alignStretch: false,
    alignBaseline: false,
  },
);

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  center: 'center',
};

const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  stretch: 'stretch',
  baseline: 'baseline',
};

// Compute direction from shortcuts or prop
const computedDirection = computed(() => {
  if (props.columnReverse) return 'column-reverse';
  if (props.rowReverse) return 'row-reverse';
  if (props.column) return props.reverse ? 'column-reverse' : 'column';
  if (props.row) return props.reverse ? 'row-reverse' : 'row';
  if (props.reverse) return `${props.direction}-reverse`;
  return props.direction;
});

// Compute justify from shortcuts or prop
const computedJustify = computed(() => {
  if (props.start) return 'start';
  if (props.center) return 'center';
  if (props.end) return 'end';
  if (props.between) return 'between';
  if (props.around) return 'around';
  if (props.evenly) return 'evenly';
  return props.justify;
});

// Compute align from shortcuts or prop
const computedAlign = computed(() => {
  if (props.alignStart) return 'start';
  if (props.alignCenter) return 'center';
  if (props.alignEnd) return 'end';
  if (props.alignStretch) return 'stretch';
  if (props.alignBaseline) return 'baseline';
  return props.align;
});

const cssJustify = computed(() => {
  return justifyMap[computedJustify.value] ?? computedJustify.value;
});

const cssAlign = computed(() => {
  return alignMap[computedAlign.value] ?? computedAlign.value;
});

const cssGap = computed(() => {
  if (STYLE_SIZES.includes(props.gap as StyleSize)) {
    return `var(--gap-${props.gap})`;
  }
  return props.gap;
});

const display = computed(() => (props.inline ? 'inline-flex' : 'flex'));

// Expose computed values for testing
defineExpose({
  get $el() {
    return rootRef.value;
  },
  // Exposed for testing
  computedDirection,
  computedJustify,
  computedAlign,
  cssJustify,
  cssAlign,
  cssGap,
  display,
});
</script>

<style lang="scss" scoped>
.flex-container {
  display: v-bind(display);
  flex-direction: v-bind(computedDirection);
  justify-content: v-bind(cssJustify);
  align-items: v-bind(cssAlign);
  gap: v-bind(cssGap);
}
</style>
