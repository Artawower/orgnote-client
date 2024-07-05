<template>
  <q-card class="full-height color-main cursor-pointer">
    <q-card-section class="full-height flex center items-center">
      <div class="full-width lock-description">
        <q-icon
          class="shield-icon color-main"
          name="sym_o_encrypted"
          size="12rem"
        />
        <h4 class="text-center">{{ noteName }} {{ $t('is encrypted') }}</h4>
        <h5 class="text-center q-mt-md">
          {{ $t('please, configure encryption settings for decrypt note') }}
        </h5>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
defineProps<{
  noteName?: string;
}>();
</script>

<style lang="scss">
.lock-description {
  position: relative;
}
.shield-icon {
  position: absolute;
  opacity: 0.3;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
