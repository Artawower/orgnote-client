<template>
  <div class="interface-settings">
    <settings-scheme :name="t(TXT_COMMON)" :entries="commonEntries" path="ui"></settings-scheme>
    <settings-scheme :name="t(TXT_THEMES)" :entries="themeEntries" path="ui"></settings-scheme>
    <settings-scheme :name="t(TXT_EDITOR)" :entries="editorEntries" path="editor"></settings-scheme>
    <settings-scheme
      :name="t(TXT_COMPLETION)"
      :entries="completionEntries"
      path="completion"
    ></settings-scheme>
  </div>
</template>

<script lang="ts" setup>
import SettingsScheme from './SettingsScheme.vue';
import { useI18n } from 'vue-i18n';
import {
  TXT_COMPLETION,
  TXT_COMMON,
  TXT_EDITOR,
  TXT_THEMES,
  ORG_NOTE_CONFIG_SCHEMA,
} from 'orgnote-api';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const commonEntries = { ...ORG_NOTE_CONFIG_SCHEMA.entries.ui.entries };
delete commonEntries['theme'];
delete commonEntries['darkThemeName'];
delete commonEntries['lightThemeName'];
const themeEntries = { theme: ORG_NOTE_CONFIG_SCHEMA.entries.ui.entries['theme'] };

const editorEntries = ORG_NOTE_CONFIG_SCHEMA.entries.editor.entries;
const completionEntries = ORG_NOTE_CONFIG_SCHEMA.entries.completion.entries;
</script>

<style lang="scss" scoped>
.interface-settings {
  width: 100%;
}
</style>
