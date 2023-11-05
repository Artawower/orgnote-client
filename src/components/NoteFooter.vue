<template>
  <div class="footer column q-py-bp-lg full-width">
    <slot></slot>
    <div class="note-actions full-width row justify-between">
      <div class="left">
        <q-checkbox
          v-if="selectable"
          :size="iconSize"
          :model-value="selectedNotesStore.isNoteSelected(note.id)"
          @update:model-value="selectedNotesStore.toggleNoteSelection(note.id)"
        ></q-checkbox>
      </div>
      <div class="right row gap-sm action-btns">
        <q-btn
          :size="iconSize"
          flat
          round
          icon="far fa-bookmark"
          class="q-pa-none"
        />
        <q-btn
          :size="iconSize"
          flat
          round
          icon="far fa-paper-plane"
          class="q-pa-none"
        >
          <q-menu class="flex row no-wrap">
            <q-btn
              flat
              rounded
              :size="iconSize"
              icon="fa-brands fa-square-twitter"
              class="q-pa-sm"
              @click="showNotImplemented('Twitter share')"
            ></q-btn>
            <q-btn
              flat
              rounded
              :size="iconSize"
              icon="fa-brands fa-telegram"
              class="q-pa-sm"
              @click="showNotImplemented('Telegram share')"
            ></q-btn>
            <q-btn
              flat
              rounded
              :size="iconSize"
              icon="far fa-copy"
              class="q-pa-sm"
              @click="showNotImplemented('Copy link')"
            ></q-btn>
          </q-menu>
        </q-btn>
        <q-btn
          :size="iconSize"
          flat
          round
          icon="fas fa-ellipsis"
          class="q-pa-none"
        >
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                v-if="note.isMy"
                clickable
                v-close-popup
                @click="deleteNote"
              >
                <q-item-section class="text-capitalize">{{
                  $t('delete')
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="note.isMy"
                clickable
                v-close-popup
                @click="editNote"
              >
                <q-item-section class="text-capitalize">{{
                  $t('edit')
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="!note.isMy"
                clickable
                v-close-popup
                @click="showNotImplemented($t('report'))"
              >
                <q-item-section class="text-capitalize">{{
                  $t('report')
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="!note.isMy"
                clickable
                v-close-popup
                @click="showNotImplemented($t('save'))"
              >
                <q-item-section class="text-capitalize">{{
                  $t('save')
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNotifications, usePlatformSize } from 'src/hooks';
import { Note, NotePreview } from 'src/models';
import { RouteNames } from 'src/router/routes';
import { useNotesStore, useSelectedNotesStore } from 'src/stores';
import { useRouter } from 'vue-router';

import { toRef } from 'vue';

const props = defineProps<{
  selectable?: boolean;
  note?: Note | NotePreview;
}>();

const selectable = toRef(props, 'selectable');
const note = toRef(props, 'note');

const selectedNotesStore = useSelectedNotesStore();

const notifications = useNotifications();

const showNotImplemented = (feature: string) => {
  notifications.notify(`Feature ${feature} is not implemented yet!`);
};

const notesStore = useNotesStore();
const router = useRouter();
const deleteNote = async () => {
  await notesStore.markAsDeleted([note.value.id]);
  router.push({ name: RouteNames.Home });
};

const editNote = () => {
  router.push({ name: RouteNames.EditNote, params: { id: note.value.id } });
};

const { iconSize } = usePlatformSize();
</script>

<style lang="scss" scoped>
.action-btns {
  height: 33.15px;

  .q-btn {
    width: 33.15px;
  }
}
</style>
