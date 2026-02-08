<template>
  <template v-if="actualType === 'union'">
    <menu-item
      @click="config[props.path][props.name] = option.literal"
      v-for="(option, k) of actualScheme.options"
      :key="k"
      :selected="config[props.path][props.name] === option.literal"
      :active="config[props.path][props.name] === option.literal"
    >
      <div class="capitalize menu-item-content">
        {{ option.literal }}
      </div>
    </menu-item>
  </template>
  <template v-else-if="actualType === 'array'">
    <menu-item v-for="(_, i) of config[props.path][props.name]" :key="i">
      <app-input
        v-model="config[props.path][props.name][i]"
        :type="actualScheme.type"
        :name="name"
        ref="editInputRef"
      />
      <template #right>
        <action-button
          class="action-btn"
          @click="removeFromArray(i)"
          icon="delete"
          size="sm"
          outline
          hover-color="red"
        ></action-button>
      </template>
    </menu-item>
    <menu-item type="info" @click="addValueToArray">
      {{ t(I18N.ADD) }}
    </menu-item>
  </template>
  <template v-else-if="metadata?.textarea">
    <menu-item @click="onItemClick" :lines="4" :placeholder="camelCaseToWords(name)">
      <app-description padded>{{ camelCaseToWords(name) }}</app-description>
      <app-text-area ref="editInputRef" v-model="config[props.path][props.name]"></app-text-area>
    </menu-item>
    <menu-item @click="uploadConfigFile" v-if="metadata.upload" type="info">
      {{ t(I18N.UPLOAD) }} {{ camelCaseToWords(name) }}
    </menu-item>
  </template>
  <menu-item
    v-else
    @click="onItemClick"
    :path="getNestedPath(name)"
    :key="name"
    :prefer="inputSchemeType ? 'right' : 'left'"
  >
    <div v-if="!metadata?.textarea" class="capitalize text-medium menu-item-content">
      {{ camelCaseToWords(name) }}
    </div>
    <template #right>
      <toggle-button
        @click.prevent
        v-if="actualType === 'boolean'"
        v-model="config[props.path][props.name]"
        @click="ensureValue"
      />
      <app-input
        v-else-if="inputSchemeType"
        v-model="config[props.path][props.name]"
        :textRight="true"
        :type="actualType === 'string' ? 'text' : 'number'"
        :name="name"
        ref="editInputRef"
        @focus="ensureValue"
      />
      <div v-if="isOptional && config[props.path][props.name] == null" class="optional-indicator">
        <span class="text-grey-6">{{ camelCaseToWords('optional') }}</span>
      </div>
    </template>
  </menu-item>
</template>

<script lang="ts" setup>
import MenuItem from './MenuItem.vue';
import ToggleButton from 'src/components/ToggleButton.vue';
import AppInput from 'src/components/AppInput.vue';
import ActionButton from 'src/components/ActionButton.vue';
import type { OrgNoteConfig } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ValibotScheme } from 'src/models/valibot-scheme';
import AppTextArea from './AppTextArea.vue';
import AppDescription from 'src/components/AppDescription.vue';
import { isPresent } from 'orgnote-api/utils';

const props = defineProps<{
  path: keyof OrgNoteConfig;
  name: string;
  scheme: ValibotScheme;
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { config } = api.core.useConfig() as Record<string, any>;
const getNestedPath = (path: string) => `${props.path}.${path}`;

const editInputRef = ref<typeof AppInput>();

const onItemClick = () => {
  ensureValue();

  if (editInputRef.value) {
    editInputRef.value.focus();
  }
  if (actualType.value === 'boolean') {
    config[props.path][props.name] = !config[props.path][props.name];
  }
};

const addValueToArray = () => {
  if (actualType.value === 'array') {
    ensureValue();
    config[props.path][props.name].push('');
  }
};

const removeFromArray = (index: number) => {
  if (actualType.value === 'array') {
    config[props.path][props.name].splice(index, 1);
  }
};

const uploadConfigFile = async () => {
  const file = await api.utils.uploadFile();
  config[props.path][props.name] = await file?.text();
};

const metadata = props.scheme.pipe?.find((e) => e.type === 'metadata')?.metadata;

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const isLiteralUnion = (s: ValibotScheme): boolean =>
  s.type === 'union' && !!s.options?.length && s.options.every((o) => o.type === 'literal');

const normalizedScheme = computed((): ValibotScheme => {
  if (props.scheme.type !== 'optional' || !props.scheme.wrapped) return props.scheme;
  return props.scheme.wrapped;
});

const actualType = computed(() => {
  const s = normalizedScheme.value;
  if (isLiteralUnion(s)) return 'union';
  if (s.type !== 'union') return s.type;
  const primaryOption = s.options?.find((o) => o.type !== 'literal');
  return primaryOption?.type ?? s.type;
});

const actualScheme = normalizedScheme;

const isOptional = computed(() => props.scheme.type === 'optional');

const DEFAULT_VALUES_BY_TYPE = {
  boolean: false,
  string: '',
  number: 0,
  array: [],
} as const;

type SupportedType = keyof typeof DEFAULT_VALUES_BY_TYPE;
type DefaultValue = (typeof DEFAULT_VALUES_BY_TYPE)[SupportedType];

const getDefaultValueForType = (type: string): DefaultValue | undefined => {
  return DEFAULT_VALUES_BY_TYPE[type as SupportedType];
};

const ensureValue = (): void => {
  if (!isOptional.value) return;
  if (isPresent(config[props.path][props.name])) return;

  const defaultValue = getDefaultValueForType(actualType.value);
  if (defaultValue === undefined) return;

  config[props.path][props.name] = defaultValue;
};

const inputTypes = ['string', 'number'];
const inputSchemeType = computed(() => inputTypes.includes(actualType.value));
</script>

<style lang="scss" scoped>
.action-btn {
  opacity: 0;
  pointer-events: none;
  background-color: var(--menu-item-hover-bg);
}

@media (hover: hover) and (pointer: fine) {
  .menu-item:hover {
    .action-btn {
      opacity: 1;
      pointer-events: auto;
    }
  }
}

textarea {
  min-height: calc(4 * var(--menu-item-height));
}

.optional-controls {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);

  .reset-btn {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

@media (hover: hover) and (pointer: fine) {
  .menu-item:hover .optional-controls .reset-btn {
    opacity: 1;
  }
}

.optional-indicator {
  font-size: var(--font-size-sm);
  font-style: italic;
}
</style>
