<template>
  <div class="container">
    <h5 class="capitalize">
      {{ $t('new release available') }}:
      <span class="color-green">{{ systemInfo.update.version }}</span>
    </h5>
    <the-seporator />
    <ul class="changelog">
      <li v-for="c of changeLog" :key="c">
        {{ c }}
      </li>
    </ul>
    <q-card-actions align="right">
      <q-btn
        :href="systemInfo.update.url"
        target="_blank"
        flat
        color="black"
        class="q-mt-md"
        :label="$t('check details')"
      />
      <q-btn
        @click="installUpdate"
        flat
        color="black"
        class="q-mt-md"
        :label="$t('install update')"
      />
    </q-card-actions>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import TheSeporator from 'src/components/ui/TheSeporator.vue';
import { useSystemInfoStore } from 'src/stores/system-info';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';

const { systemInfo } = useSystemInfoStore();

const changeLog = computed(
  () => systemInfo.update?.changeLog?.split('\n').slice(1) ?? []
);

const { orgNoteApi } = useOrgNoteApiStore();

const installUpdate = () => {
  orgNoteApi.system.reload();
};
</script>

<style lang="scss" scoped>
.container {
  @include flexify(column, flex-start, flex-start);
  height: 100%;
}

.container,
.q-card__actions,
.changelog {
  width: 100%;
}

.changelog {
  flex: 1;
}
</style>
