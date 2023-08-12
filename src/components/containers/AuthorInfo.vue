<template>
  <div @click="openProfile" class="row cursor-pointer flex-center">
    <div class="q-mr-md">
      <q-avatar size="24px" class="q-mx-auto">
        <img :src="author.avatarUrl" />
      </q-avatar>
    </div>
    <div class="col">
      <span v-if="author.nickName">{{ author.nickName }}</span
      >&nbsp;
      <span v-if="author.email" class="text-italic">{{ author.email }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { models_PublicUser } from 'src/generated';
import { toRef } from 'vue';

const props = defineProps<{
  // TODO: master convert to camelCase.
  author: models_PublicUser;
}>();

const author = toRef(props, 'author');

const openProfile = () => window.open(author.value.profileUrl, '_blank');
</script>
