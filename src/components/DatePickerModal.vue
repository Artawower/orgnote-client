<template>
  <app-flex class="date-picker-modal" column start align-stretch gap="md">
    <app-date-picker
      v-model="selectedDate"
      class="date-picker-modal-calendar"
      mode="single"
      @update:model-value="handleUpdate"
    />
    <card-wrapper>
      <menu-item @click="handleCancel">
        {{ t(I18N.CANCEL) }}
      </menu-item>
    </card-wrapper>
  </app-flex>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import type { DatePickerModelValue } from 'src/models/date-picker';
import AppDatePicker from './AppDatePicker.vue';
import AppFlex from './AppFlex.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import CardWrapper from './CardWrapper.vue';

const props = defineProps<{
  initialDate?: string;
}>();

const { t } = useI18n();
const modal = api.ui.useModal();
const selectedDate = ref<string | undefined>(props.initialDate);

const handleUpdate = (value: DatePickerModelValue): void => {
  if (typeof value === 'string') {
    modal.close(value);
    return;
  }

  modal.close();
};

const handleCancel = (): void => {
  modal.close();
};
</script>

<style lang="scss" scoped>
:host {
  background: red;
}
.date-picker-modal {
  min-width: min(100vw - var(--padding-lg), 320px);
}

.date-picker-modal-calendar {
  width: 100%;
}
</style>
