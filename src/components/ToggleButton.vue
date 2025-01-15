<template>
  <div class="switch__container">
    <input :id="id" class="switch switch--flat" type="checkbox" v-model="model" />
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
/* https://codepen.io/fellipe/pen/adzmPR */

/* Estilo iOS */
.switch__container {
  margin: 0 auto;
  width: 120px;
  transform: scale(var(--toggle-button-scale)) translateX(calc(var(--toggle-button-scale) * 100%));
  padding-left: 20px;
}

.switch {
  visibility: hidden;
  position: absolute;
  margin-left: -9999px;
}

.switch + label {
  display: block;
  position: relative;
  cursor: pointer;
  outline: none;
  user-select: none;
}

/* Estilo Flat */
.switch--flat + label {
  padding: 2px;
  width: 120px;
  height: 60px;
  background-color: #dddddd;
  border-radius: 60px;
  transition: background 0.4s;
}

.switch--flat + label:before,
.switch--flat + label:after {
  display: block;
  position: absolute;
  content: '';
}

.switch--flat + label:before {
  top: 2px;
  left: 2px;
  bottom: 2px;
  right: 2px;
  background-color: var(--bg);
  border-radius: 60px;
  transition: background 0.4s;
}

.switch--flat + label:after {
  top: 4px;
  left: 4px;
  bottom: 4px;
  width: 56px;
  background-color: #dddddd;
  border-radius: 52px;
  transition:
    margin 0.4s,
    background 0.4s;
}

.switch--flat:checked + label {
  background-color: var(--accent);
}

.switch--flat:checked + label:after {
  margin-left: 60px;
  background-color: var(--accent);
}
</style>
