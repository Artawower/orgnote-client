<template>
  <div class="full-width">
    <h5 class="text-h5 q-pb-lg text-capitalize">
      {{ $t('common settings') }}
    </h5>

    <language-switcher></language-switcher>
  </div>
</template>

<script lang="ts" setup>
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
</script>

<style lang="scss"></style>
