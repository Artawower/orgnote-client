<template>
  <div @click="openProfile" class="row cursor-pointer flex-center">
    <div class="q-mr-md">
      <q-avatar size="24px" class="q-mx-auto">
        <img :src="author.avatarUrl" alt="avatr url" />
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
import { ModelsPublicUser } from 'src/generated/api';
import { toRef } from 'vue';

const props = defineProps<{
  author: ModelsPublicUser;
}>();

const author = toRef(props, 'author');

const openProfile = () => window.open(author.value.profileUrl, '_blank');
</script>
