<template>
  <div class="q-pa-md row gap-32">
    <a
      v-for="link of links"
      :key="link.name"
      class="project-link flex column items-center col-1 gap-8"
      :href="link.url"
      target="_blank"
    >
      <img class="icon" :src="link.icon" alt="codemirror logo" />
      {{ link.name }}
    </a>
  </div>
</template>

<script lang="ts">
export default { name: 'AcknowledgementsPage' };
</script>

<script lang="ts" setup>
const links = [
  {
    name: 'emacs',
    url: 'https://www.gnu.org/software/emacs/',
    icon: 'https://www.gnu.org/software/emacs/images/emacs.png',
  },
  {
    name: 'Org-roam',
    url: 'https://www.orgroam.com/',
    icon: 'https://www.orgroam.com/img/logo.png',
  },
  {
    name: 'CodeMirror',
    url: 'https://codemirror.net/',
    icon: 'https://codemirror.net/style/logo.svg',
  },
  {
    name: 'Quasar',
    url: 'https://quasar.dev/',
    icon: 'https://cdn.quasar.dev/logo-v2/svg/logo-dark.svg',
  },
  {
    name: 'Cordova',
    url: 'https://cordova.apache.org/',
    icon: 'https://cordova.apache.org/static/img/cordova_bot.png',
  },
  {
    name: 'ZenFS',
    url: 'https://github.com/zen-fs/corei',
    icon: 'https://avatars.githubusercontent.com/u/164564881?s=200&v=4',
  },
] as const;
</script>

<style lang="scss" scoped>
.project-link {
  width: 64px;
}
.icon {
  display: block;
  width: 64px;
  height: 64px;
}

a {
  color: var(--fg);
}
</style>
