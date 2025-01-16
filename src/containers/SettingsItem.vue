<template>
  <template v-if="scheme.type === 'union'">
    <menu-item
      @click="config[props.path][props.name] = option.literal"
      v-for="(option, k) of scheme.options"
      :key="k"
      :selected="config[props.path][props.name] === option.literal"
      :active="config[props.path][props.name] === option.literal"
    >
      <div class="capitalize menu-item-content">
        {{ option.literal }}
      </div>
    </menu-item>
  </template>
  <template v-else-if="scheme.type === 'array'">
    <menu-item v-for="(_, i) of config[props.path][props.name]" :key="i">
      <app-input
        v-model="config[props.path][props.name][i]"
        :type="scheme.type"
        :name="name"
        ref="editInputRef"
      />
      <template #right>
        <div class="action-btn">
          <action-button
            @click="removeFromArray(i)"
            icon="delete"
            size="sm"
            outline
            hover-color="red"
          ></action-button>
        </div>
      </template>
    </menu-item>
    <menu-item type="info" @click="addValueToArray">
      {{ t(TXT_ADD) }}
    </menu-item>
  </template>
  <template v-else-if="metadata?.textarea">
    <menu-item @click="onItemClick" :lines="4" :placeholder="camelCaseToWords(name)">
      <app-description padded>{{ camelCaseToWords(name) }}</app-description>
      <app-text-area ref="editInputRef" v-model="config[props.path][props.name]"></app-text-area>
    </menu-item>
    <menu-item @click="uploadConfigFile" v-if="metadata.upload" type="info">
      {{ t(TXT_UPLOAD) }} {{ camelCaseToWords(name) }}
    </menu-item>
  </template>
  <menu-item
    v-else
    @click="onItemClick"
    :path="getNestedPath(name)"
    :key="name"
    :prefer="inputSchemeType ? 'right' : 'left'"
  >
    <div v-if="!metadata?.textarea" class="capitalize text-bold menu-item-content">
      {{ camelCaseToWords(name) }} {{ scheme.type }}
    </div>
    <template #right>
      <toggle-button
        @click.prevent
        v-if="scheme.type === 'boolean'"
        v-model="config[props.path][props.name]"
      />
      <app-input
        v-else-if="inputSchemeType"
        v-model="config[props.path][props.name]"
        :textRight="true"
        :type="scheme.type === 'string' || scheme.wrapped?.type === 'string' ? 'text' : 'number'"
        :name="name"
        ref="editInputRef"
      />
    </template>
  </menu-item>
</template>

<script lang="ts" setup>
import MenuItem from './MenuItem.vue';
import ToggleButton from 'src/components/ToggleButton.vue';
import AppInput from 'src/components/AppInput.vue';
import ActionButton from 'src/components/ActionButton.vue';
import type { OrgNoteConfig } from 'orgnote-api';
import { TXT_ADD, TXT_UPLOAD } from 'orgnote-api';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ValibotScheme } from 'src/models/valibot-scheme';
import AppTextArea from './AppTextArea.vue';
import AppDescription from 'src/components/AppDescription.vue';

const props = defineProps<{
  path: keyof OrgNoteConfig;
  name: string;
  scheme: ValibotScheme;
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { config } = api.core.useSettings() as Record<string, any>;
const getNestedPath = (path: string) => `${props.path}.${path}`;

const editInputRef = ref<typeof AppInput | null>(null);

const onItemClick = () => {
  if (editInputRef.value) {
    editInputRef.value.focus();
  }
  if (props.scheme.type === 'boolean') {
    config[props.path][props.name] = !config[props.path][props.name];
  }
};

const addValueToArray = () => {
  if (props.scheme.type === 'array') {
    config[props.path][props.name].push('');
  }
};

const removeFromArray = (index: number) => {
  if (props.scheme.type === 'array') {
    config[props.path][props.name].splice(index, 1);
  }
};

const uploadConfigFile = async () => {
  const file = await api.utils.uploadFile();
  config[props.path][props.name] = await file.text();
};

const metadata = props.scheme.pipe?.find((e) => e.type === 'metadata')?.metadata;

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const inputTypes = ['string', 'number'];
const inputSchemeType = computed(
  () => inputTypes.includes(props.scheme?.type) || inputTypes.includes(props.scheme?.wrapped?.type),
);
</script>

<style lang="scss" scoped>
.action-btn {
  display: none;
}

.menu-item:hover {
  .action-btn {
    display: block;
  }
}

textarea {
  min-height: calc(4 * var(--menu-item-height));
}
</style>
