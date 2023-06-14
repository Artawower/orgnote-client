<template>
  <q-page padding>
    <div class="col-12 q-gutter-y-md">
      <router-view />
    </div>
    <mode-line>
      <q-route-tab
        icon="tune"
        :to="{ name: RouteNames.ViewSettings }"
        exact
        :label="$t('visual')"
      />
      <q-route-tab
        icon="settings"
        exact
        :to="{ name: RouteNames.CommonSettings }"
        :label="$t('common')"
      >
      </q-route-tab>
      <q-route-tab
        icon="keyboard"
        exact
        :to="{ name: RouteNames.Keybindings }"
        :label="$t('keybindings')"
      >
      </q-route-tab>
      <q-route-tab
        icon="generating_tokens"
        :to="{ name: RouteNames.ApiSettings }"
        exact
        :label="$t('API tokens')"
      />
    </mode-line>
  </q-page>
</template>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';
import ModeLine from 'src/components/ui/ModeLine.vue';
</script>
