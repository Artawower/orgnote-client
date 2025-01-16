<template>
  <div>
    <input :id="id" name="toggle" class="sw" type="checkbox" v-model="model" />
    <label :for="id"></label>
  </div>
</template>

<script lang="ts" setup>
import { useId } from 'quasar';

defineProps<{
  type?: 'flat' | 'shadow';
}>();

const model = defineModel();
const id = useId();
</script>

<style lang="scss" scoped>
// https://codepen.io/kowlor/pen/ByavWB
$sw-height: 30px;
$sw-width: 51px;

input {
  &.sw {
    opacity: 0;
    position: absolute;
    left: -9999px;
    & + label {
      cursor: pointer;
      transition: 0.2s ease;
      display: inline-block;
      height: $sw-height;
      width: $sw-width;
      position: relative;
      box-shadow: inset 0 0 0px 2px #e4e4e4;
      border-radius: 60px;
      &:before {
        content: '';
        position: absolute;
        display: block;
        height: $sw-height;
        width: $sw-height;
        top: 0;
        left: 0;
        border-radius: $sw-height/2;
        background: rgba(76, 217, 100, 0);
        transition: 0.2s cubic-bezier(0.24, 0, 0.5, 1);
      }

      /* White toggle */
      &:after {
        content: '';
        position: absolute;
        display: block;
        height: 28px;
        width: 28px;
        top: 50%;
        margin-top: -14px;
        left: 1px;
        border-radius: 60px;
        background: #fff;
        box-shadow:
          0 0 0 1px hsla(0, 0%, 0%, 0.1),
          0 4px 0px 0 hsla(0, 0%, 0%, 0.04),
          0 4px 9px hsla(0, 0%, 0%, 0.13),
          0 3px 3px hsla(0, 0%, 0%, 0.05);
        transition: 0.35s cubic-bezier(0.54, 1.6, 0.5, 1);
      }
      span {
        white-space: nowrap;
        height: $sw-height;
        line-height: $sw-height;
        margin-left: $sw-width;
        padding-left: 16px;
      }
    }
    &:checked {
      & + label:before {
        width: $sw-width;
        background: var(--accent);
        transition: width 0.2s cubic-bezier(0, 0, 0, 0.1) !important;
      }

      & + label:after {
        left: $sw-width - $sw-height + 1;
      }

      & + label {
        box-shadow: inset 0 0 0px 25px #e4e4e4;
        transition: box-shadow 2.5s cubic-bezier(0, 1.2, 0.94, 0.95);
      }
    }
  }
}
</style>
