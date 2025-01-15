<template>
  <template v-if="scheme.type === 'union'">
    <menu-item
      @click="config[props.path][props.name] = option.literal"
      v-for="option of scheme.options"
      :key="option"
      :selected="config[props.path][props.name] === option.literal"
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
    <menu-item :active="true" @click="addValueToArray">
      <div class="capitalize">{{ t(TXT_ADD) }}</div>
    </menu-item>
  </template>
  <menu-item v-else @click="onItemClick" :path="getNestedPath(name)" :key="name">
    <div class="capitalize text-bold menu-item-content">
      {{ camelCaseToWords(name) }}
    </div>
    <template #right>
      <toggle-button
        @click.prevent
        v-if="scheme.type === 'boolean'"
        v-model="config[props.path][props.name]"
      />
      <app-input
        v-else-if="scheme.type === 'number'"
        v-model="config[props.path][props.name]"
        :textRight="true"
        :type="scheme.type"
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
import { TXT_ADD } from 'orgnote-api';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  path: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scheme: Record<string, any>;
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

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
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
</style>
