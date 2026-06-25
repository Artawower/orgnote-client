<template>
  <app-flex
    class="org-property-editor"
    :class="[`scope-${scope}`, { collapsed: isCollapsed }]"
    column
    align-stretch
    gap="xs"
    contenteditable="false"
    @mousedown.stop
    @click.stop
  >
    <app-flex
      v-if="isCollapsed"
      class="property-trigger"
      start
      gap="sm"
      @mousedown.stop.prevent
      @click.stop="expandPanel"
    >
      <app-icon name="sym_o_tune" size="sm" color="fg-muted" />
      <span class="property-title">{{ t(I18N.PROPERTIES) }}</span>
    </app-flex>

    <template v-else>
      <app-flex class="property-header" between align-center>
        <app-flex
          class="property-title-action"
          start
          gap="sm"
          @mousedown.stop.prevent
          @click.stop="togglePanel"
        >
          <app-icon name="sym_o_tune" size="sm" color="fg-muted" />
          <span class="property-title">{{ t(I18N.PROPERTIES) }}</span>
        </app-flex>
        <app-flex gap="xs">
          <action-button
            v-if="canCollapse"
            :icon="collapseIcon"
            size="sm"
            color="fg-muted"
            @click.stop="togglePanel"
          />
        </app-flex>
      </app-flex>

      <app-flex
        v-for="item in items"
        :key="item.key"
        class="property-row"
        align-center
        gap="md"
        @mousedown.stop
        @click.stop
      >
        <app-icon :name="iconByKey(item.key)" size="sm" color="fg-muted" />
        <template v-if="readonly">
          <span class="property-key">{{ item.key }}</span>
          <component :is="valueComponent(item)" :item="item" readonly />
        </template>
        <template v-else>
          <span class="property-key editing">
            <app-dropdown
              :model-value="item.key"
              :options="knownPropertyKeys"
              :taggable="true"
              :clearable="false"
              :placeholder="t(I18N.PROPERTY_PLACEHOLDER)"
              @update:model-value="setKey(item, $event)"
            >
              <template #option="{ label }">
                <app-flex start gap="sm">
                  <app-icon :name="iconByKey(label)" size="sm" color="fg-muted" />
                  <span>{{ label }}</span>
                </app-flex>
              </template>
            </app-dropdown>
          </span>
          <component
            :is="valueComponent(item)"
            :item="item"
            @set="setValue(item.key, $event)"
            @remove-tag="removeTag(item, $event)"
            @add-tag="addTag(item, $event)"
          />
        </template>

        <app-flex v-if="!readonly" class="property-actions" gap="xs">
          <action-button
            icon="sym_o_content_copy"
            size="sm"
            color="fg-muted"
            :copy-text="item.value"
          />
          <action-button
            icon="sym_o_delete"
            size="sm"
            color="fg-muted"
            @click.stop="removeProperty(item.key)"
          />
        </app-flex>
      </app-flex>

      <app-flex
        v-if="isAdding"
        class="property-row editing-row"
        align-center
        gap="md"
        @mousedown.stop
        @click.stop
      >
        <app-icon name="sym_o_notes" size="sm" color="fg-muted" />
        <span class="property-key editing" @keydown.esc="cancelEdit">
          <app-dropdown
            ref="addKeyInputRef"
            v-model="draftKey"
            :options="knownPropertyKeys"
            :taggable="true"
            :clearable="false"
            :placeholder="t(I18N.PROPERTY_PLACEHOLDER)"
            @update:model-value="focusValueInput"
          >
            <template #option="{ label }">
              <app-flex start gap="sm">
                <app-icon :name="iconByKey(label)" size="sm" color="fg-muted" />
                <span>{{ label }}</span>
              </app-flex>
            </template>
          </app-dropdown>
        </span>
        <app-text-area
          ref="valueInputRef"
          v-model="draftValue"
          class="property-value editing"
          :placeholder="t(I18N.EMPTY_VALUE_PLACEHOLDER)"
          :rows="1"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc.prevent="cancelEdit"
          @blur="commitEdit"
        />
        <app-flex class="property-actions" gap="xs">
          <action-button icon="sym_o_check" size="sm" color="fg-muted" @click.stop="commitEdit" />
          <action-button icon="sym_o_close" size="sm" color="fg-muted" @click.stop="cancelEdit" />
        </app-flex>
      </app-flex>

      <app-flex v-if="error" class="property-error" start>{{ error }}</app-flex>

      <action-button
        v-if="!readonly && !isAdding"
        icon="sym_o_add"
        size="sm"
        color="fg-muted"
        variant="text"
        alignment="left"
        @click.stop="startAdd"
      >
        <template #text>
          <span>{{ t(I18N.ADD_PROPERTY) }}</span>
        </template>
      </action-button>
    </template>
  </app-flex>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import type { EditorView } from '@codemirror/view';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import ActionButton from 'src/components/ActionButton.vue';
import AppDropdown from 'src/components/AppDropdown.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppTextArea from 'src/components/AppTextArea.vue';
import { usePropertyDrawer } from './use-property-drawer';

const props = defineProps<{
  node: OrgNode;
  editorView: EditorView;
  rootNodeSrc: string;
  readonly?: boolean;
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const {
  addKeyInputRef,
  addTag,
  canCollapse,
  cancelEdit,
  collapseIcon,
  commitEdit,
  draftKey,
  draftValue,
  error,
  expandPanel,
  focusValueInput,
  iconByKey,
  isAdding,
  isCollapsed,
  items,
  knownPropertyKeys,
  readonly,
  removeProperty,
  removeTag,
  scope,
  setKey,
  setValue,
  startAdd,
  togglePanel,
  valueComponent,
  valueInputRef,
} = usePropertyDrawer(props);
</script>

<style scoped lang="scss">
@import './property-drawer.scss';
</style>
