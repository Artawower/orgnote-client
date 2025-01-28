<template>
  <div class="interface-settings">
    <settings-scheme :name="t(I18N.COMMON)" :scheme="commonScheme" path="ui"></settings-scheme>
    <settings-scheme :name="t(I18N.THEMES)" :scheme="themeScheme" path="ui"></settings-scheme>
    <settings-scheme :name="t(I18N.EDITOR)" :scheme="editorScheme" path="editor"></settings-scheme>
    <settings-scheme
      :name="t(I18N.COMPLETION)"
      :scheme="completionScheme"
      path="completion"
    ></settings-scheme>
  </div>
</template>

<script lang="ts" setup>
import SettingsScheme from './SettingsScheme.vue';
import { useI18n } from 'vue-i18n';
import { I18N, ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import { valibotScheme } from 'src/models/valibot-scheme';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const commonScheme = valibotScheme({ ...ORG_NOTE_CONFIG_SCHEMA.entries.ui });
const theme = valibotScheme({ ...ORG_NOTE_CONFIG_SCHEMA.entries.ui.entries.theme });
delete commonScheme.entries['theme'];
delete commonScheme.entries['darkThemeName'];
delete commonScheme.entries['lightThemeName'];
const themeScheme = valibotScheme({ ...ORG_NOTE_CONFIG_SCHEMA.entries.ui });
themeScheme.entries = {
  theme,
};

const editorScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.editor);
const completionScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.completion);
</script>

<style lang="scss" scoped>
.interface-settings {
  width: 100%;
}
</style>
