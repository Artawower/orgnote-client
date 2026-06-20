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
      <span>{{ previewText }}</span>
    </app-flex>

    <template v-else>
      <app-flex class="property-header" between align-center>
        <strong>{{ t(I18N.PROPERTIES) }}</strong>
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
        <span v-if="isEditingKey(item.key)" class="property-key editing" @keydown.esc="cancelEdit">
          <app-dropdown
            ref="keyInputRef"
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
        <span v-else class="property-key" @click="startTextEdit(item, 'key')">{{ item.key }}</span>

        <app-text-area
          v-if="isEditingKey(item.key)"
          ref="valueInputRef"
          v-model="draftValue"
          class="property-value editing"
          :rows="1"
          @keydown.enter.prevent="commitEdit"
          @keydown.esc.prevent="cancelEdit"
          @blur="commitEdit"
        />
        <component
          v-else
          :is="valueComponent(item)"
          :item="item"
          :readonly="readonly"
          @edit="startTextEdit(item)"
          @set="setValue(item.key, $event)"
          @remove-tag="removeTag(item, $event)"
          @add-tag="addTag(item, $event)"
        />

        <app-flex v-if="!readonly" class="property-actions" gap="xs">
          <template v-if="isEditingKey(item.key)">
            <action-button icon="sym_o_check" size="sm" color="fg-muted" @click.stop="commitEdit" />
            <action-button icon="sym_o_close" size="sm" color="fg-muted" @click.stop="cancelEdit" />
          </template>
          <template v-else>
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
          </template>
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

      <app-flex
        v-if="!readonly && !isAdding"
        class="add-property"
        start
        gap="sm"
        @mousedown.stop.prevent
        @click.stop="startAdd()"
      >
        <app-icon name="sym_o_add" size="sm" color="fg-muted" />
        <span>{{ t(I18N.ADD_PROPERTY) }}</span>
      </app-flex>
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
  isEditingKey,
  items,
  keyInputRef,
  knownPropertyKeys,
  previewText,
  readonly,
  removeProperty,
  removeTag,
  scope,
  setValue,
  startAdd,
  startTextEdit,
  togglePanel,
  valueComponent,
  valueInputRef,
} = usePropertyDrawer(props);
</script>

<style scoped lang="scss">
@import './property-drawer.scss';
</style>
