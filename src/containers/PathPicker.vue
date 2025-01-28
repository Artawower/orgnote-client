<template>
  <menu-item @click="pickPath" type="info">
    {{ t(folder ? TXT_PICK_FOLDER : TXT_PICK_FILE) }}
  </menu-item>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';
import { TXT_PICK_FOLDER, TXT_PICK_FILE } from 'orgnote-api';

defineProps<{
  folder?: boolean;
  multiFiles?: boolean;
}>();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const pickPath = () => {
  console.log('[line 14]: PICK FILE');
};
</script>
