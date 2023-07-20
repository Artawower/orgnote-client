<template>
  <div @click="openProfile" class="row cursor-pointer">
    <div class="q-mr-md">
      <q-avatar size="40px" class="q-mx-auto">
        <img :src="author.avatarUrl" />
      </q-avatar>
    </div>
    <div class="col">
      <div class="text-bold">{{ author.nickName }}</div>
      <div class="text-italic">{{ author.email }}</div>
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
