<template>
  <menu-item @click="pickPath" type="info">
    {{ t(folder ? I18N.PICK_FOLDER : I18N.PICK_FILE) }}
  </menu-item>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';
import { I18N } from 'orgnote-api';

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
