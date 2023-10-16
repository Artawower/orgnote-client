<template>
  <q-dialog v-model="confirmationStore.opened" persistent>
    <q-card class="no-shadow">
      <q-card-section class="column items-start gap-8">
        <h5 class="capitalize">{{ $t(confirmationStore.title) }}</h5>
        <div class="capitalize">{{ $t(confirmationStore.description) }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          @click="confirmationStore.resolveConfirmation(false)"
          flat
          :label="$t('cancel')"
          color="red"
          v-close-popup
        />
        <q-btn
          @click="confirmationStore.resolveConfirmation(true)"
          flat
          :label="$t('confirm')"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useConfirmationModalStore } from 'src/stores/confirmation-modal';

const confirmationStore = useConfirmationModalStore();
</script>
