<template>
  <div v-if="loading" class="full-height flex items-center justify-center">
    <loader-spinner />
  </div>
  <raw-editor
    v-else-if="noteContent"
    v-model="noteContent"
    :readonly="true"
  ></raw-editor>
</template>

<script lang="ts" setup>
import { useOrgFile } from 'src/hooks';

import LoaderSpinner from 'src/components/LoaderSpinner.vue';
import RawEditor from 'src/components/containers/raw-editor/RawEditor.vue';

// TODO: master get from github about.org page
// const rspns = await axios.get('/github/Artawower/orgnote/master/ABOUT.org');
const { loading, noteContent } = useOrgFile('/about.org');
</script>
