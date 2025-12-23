<template>
  <div class="extension-item">
    <app-spoiler style="--spoiler-max-height: unset">
      <template #title>
        <app-flex row between class="full-width">
          <app-flex gap="md" align="center">
            <app-icon :name="categoryIcon" :color="isActive ? 'green' : 'fg-muted'" size="sm" />

            <app-flex column gap="xs">
              <app-flex gap="sm" align="center">
                <monochrome-face>
                  {{ manifest.name }}
                </monochrome-face>

                <app-badge :color="categoryColor" size="xs">
                  {{ manifest.category }}
                </app-badge>

                <app-badge v-if="manifest.version" color="fg-muted" size="xs">
                  v{{ manifest.version }}
                </app-badge>

                <app-badge v-if="sourceLabel" color="blue" size="xs">
                  {{ sourceLabel }}
                </app-badge>
              </app-flex>

              <app-description v-if="manifest.description" class="description">
                {{ manifest.description }}
              </app-description>
            </app-flex>
          </app-flex>

          <app-flex gap="sm" align="center">
            <template v-if="isInstalled">
              <action-button
                @click.stop="toggleActive(!isActive)"
                size="sm"
                :color="isActive ? 'green' : 'fg-muted'"
                outline
                border
                :icon="isActive ? 'sym_o_check_box' : 'sym_o_check_box_outline_blank'"
                :tooltip="toggleTooltip"
              />

              <action-button
                v-if="!isBuiltin"
                @click.stop="$emit('delete', manifest.name)"
                size="sm"
                color="red"
                outline
                border
                icon="sym_o_delete"
                :tooltip="t(i18n.DELETE_EXTENSION)"
              />
            </template>

            <action-button
              v-else
              @click.stop="handleInstall"
              size="sm"
              color="green"
              outline
              border
              icon="sym_o_download"
              :tooltip="t(i18n.INSTALL_EXTENSION)"
            />
          </app-flex>
        </app-flex>
      </template>

      <template #body>
        <app-flex column align-start gap="sm" class="extension-details">
          <app-flex v-if="manifest.author" gap="sm">
            <span class="label">{{ t(i18n.AUTHOR) }}:</span>
            <span>{{ manifest.author }}</span>
          </app-flex>

          <app-flex v-if="manifest.keywords?.length" gap="sm">
            <span class="label">{{ t(i18n.KEYWORDS) }}:</span>
            <app-flex gap="xs">
              <app-badge
                v-for="keyword in manifest.keywords"
                :key="keyword"
                color="fg-muted"
                size="xs"
              >
                {{ keyword }}
              </app-badge>
            </app-flex>
          </app-flex>

          <app-flex v-if="repoUrl" gap="sm">
            <span class="label">{{ t(i18n.REPOSITORY) }}:</span>
            <app-link :href="repoUrl">{{ repoUrl }}</app-link>
          </app-flex>

          <app-flex v-if="manifest.permissions?.length" gap="sm">
            <span class="label">{{ t(i18n.PERMISSIONS) }}:</span>
            <app-flex gap="xs">
              <app-badge
                v-for="permission in manifest.permissions"
                :key="permission"
                color="orange"
                size="xs"
              >
                {{ permission }}
              </app-badge>
            </app-flex>
          </app-flex>
        </app-flex>
      </template>
    </app-spoiler>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExtensionMeta, ExtensionManifest, ThemeVariable } from 'orgnote-api';
import { i18n } from 'orgnote-api';
import AppIcon from './AppIcon.vue';
import AppBadge from './AppBadge.vue';
import AppDescription from './AppDescription.vue';
import AppSpoiler from './AppSpoiler.vue';
import AppFlex from './AppFlex.vue';
import MonochromeFace from './MonochromeFace.vue';
import ActionButton from './ActionButton.vue';
import AppLink from './AppLink.vue';
import {
  EXTENSION_CATEGORY_ICONS,
  EXTENSION_CATEGORY_COLORS,
  DEFAULT_EXTENSION_ICON,
  DEFAULT_EXTENSION_COLOR,
} from 'src/constants/extension-category';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    extension: ExtensionMeta | ExtensionManifest;
    mode?: 'installed' | 'available';
  }>(),
  {
    mode: 'installed',
  },
);

const emit = defineEmits<{
  (e: 'enable', name: string): void;
  (e: 'disable', name: string): void;
  (e: 'delete', name: string): void;
  (e: 'install', manifest: ExtensionManifest): void;
}>();

const manifest = computed((): ExtensionManifest => {
  if ('manifest' in props.extension) {
    return props.extension.manifest;
  }
  return props.extension;
});

const isInstalled = computed(() => props.mode === 'installed');

const categoryIcon = computed(() => {
  return EXTENSION_CATEGORY_ICONS[manifest.value.category] ?? DEFAULT_EXTENSION_ICON;
});

const categoryColor = computed((): ThemeVariable => {
  return EXTENSION_CATEGORY_COLORS[manifest.value.category] ?? DEFAULT_EXTENSION_COLOR;
});

const isActive = computed(() => {
  if (!isInstalled.value) {
    return false;
  }
  return (props.extension as ExtensionMeta).active ?? false;
});

const isBuiltin = computed(() => manifest.value.source.type === 'builtin');

const sourceLabel = computed(() => {
  const source = manifest.value.source;
  return source.type ?? '';
});

const repoUrl = computed(() => {
  const source = manifest.value.source;
  if (source.type === 'git') return source.repo;
  return null;
});

const toggleTooltip = computed(() => {
  return isActive.value ? t(i18n.DISABLE_EXTENSION) : t(i18n.ENABLE_EXTENSION);
});

const toggleActive = (value: boolean) => {
  const name = manifest.value.name;
  if (value) {
    emit('enable', name);
    return;
  }
  emit('disable', name);
};

const handleInstall = () => {
  emit('install', manifest.value);
};
</script>

<style lang="scss" scoped>
.extension-item {
  width: 100%;
}

.label {
  color: var(--fg-muted);
  min-width: 80px;
}
</style>
