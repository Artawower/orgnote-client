<template>
  <q-page>
    <div class="col-12">
      <h4 class="text-h4 q-py-lg text-capitalize">
        {{ $t('common settings') }}
      </h4>

      <language-switcher></language-switcher>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
</script>

<style lang="scss"></style>
