<template>
  <safe-area style="height: 100%">
    <page-wrapper padding constrained>
      <container-layout :body-scroll="true">
        <template #header>
          <progress-dots :total-steps="steps.length" :current-step="currentStep" />
        </template>

        <component :is="currentStepConfig?.component" ref="currentStepRef" />

        <template #footer>
          <visibility-wrapper>
            <template #desktop-below>
              <card-wrapper>
                <menu-item v-if="currentStep > 0" @click="goBack">
                  {{ t(I18N.ONBOARDING_BACK) }}
                </menu-item>
                <menu-item v-if="canSkip" @click="skipSetup">
                  {{ t(I18N.ONBOARDING_SKIP) }}
                </menu-item>
                <menu-item
                  :type="isLastStep ? 'active' : 'info'"
                  @click="goNext"
                  :disabled="!canProceed"
                >
                  {{ isLastStep ? t(I18N.ONBOARDING_COMPLETED) : t(I18N.ONBOARDING_NEXT) }}
                </menu-item>
              </card-wrapper>
            </template>
            <template #desktop-above>
              <app-flex row end align-center gap="md" class="desktop-actions">
                <app-button v-if="currentStep > 0" outline @click="goBack">
                  {{ t(I18N.ONBOARDING_BACK) }}
                </app-button>
                <app-button v-if="canSkip" outline @click="skipSetup">
                  {{ t(I18N.ONBOARDING_SKIP) }}
                </app-button>
                <app-button
                  :type="isLastStep ? 'active' : 'info'"
                  @click="goNext"
                  :disabled="!canProceed"
                >
                  {{ isLastStep ? t(I18N.ONBOARDING_COMPLETED) : t(I18N.ONBOARDING_NEXT) }}
                </app-button>
              </app-flex>
            </template>
          </visibility-wrapper>
        </template>
      </container-layout>
    </page-wrapper>
  </safe-area>
  <modal-container />
</template>

<script lang="ts" setup>
import SafeArea from 'src/components/SafeArea.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import ModalContainer from 'src/containers/ModalContainer.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import AppButton from 'src/components/AppButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import ProgressDots from 'src/components/onboarding/ProgressDots.vue';
import WelcomeStep from 'src/components/onboarding/WelcomeStep.vue';
import FsSelectionStep from 'src/components/onboarding/FsSelectionStep.vue';
import ServerStep from 'src/components/onboarding/ServerStep.vue';
import EmacsStep from 'src/components/onboarding/EmacsStep.vue';

import { RouteNames } from 'orgnote-api/constants';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/api';
import { computed, ref } from 'vue';
import { I18N } from 'orgnote-api';
import { reporter } from 'src/boot/report';
import type { Component } from 'vue';

interface StepConfig {
  component: Component;
}

interface StepInstance {
  canProceed?: boolean;
}

const steps: StepConfig[] = [
  { component: WelcomeStep },
  { component: FsSelectionStep },
  { component: ServerStep },
  { component: EmacsStep },
];

const currentStep = ref(0);
const currentStepRef = ref<StepInstance | null>(null);

const router = useRouter();
const settings = api.core.useSettings();
const { onboardingCompleted } = storeToRefs(settings);

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const isLastStep = computed(() => currentStep.value === steps.length - 1);
const currentStepConfig = computed(() => steps[currentStep.value]);

const canProceed = computed(() => {
  const step = currentStepRef.value;
  if (step?.canProceed !== undefined) return step.canProceed;
  return true;
});

const canSkip = computed(() => !isLastStep.value);

const completeOnboarding = (): void => {
  onboardingCompleted.value = true;
  router.push({ name: RouteNames.Home });
};

const initDefaultFsIfNeeded = async (): Promise<void> => {
  const fsManager = api.core.useFileSystemManager();
  const { currentFsName } = storeToRefs(fsManager);
  if (currentFsName.value) return;
  const [firstFs] = fsManager.fileSystems;
  if (!firstFs) return;
  await fsManager.useFs(firstFs.name);
};

const goNext = (): void => {
  if (!canProceed.value) return;
  if (isLastStep.value) {
    completeOnboarding();
    return;
  }
  currentStep.value++;
};

const goBack = (): void => {
  if (currentStep.value > 0) currentStep.value--;
};

const skipSetup = async (): Promise<void> => {
  try {
    await initDefaultFsIfNeeded();
  } catch (e) {
    reporter.reportError(e);
  }
  completeOnboarding();
};
</script>

<style lang="scss" scoped>
.desktop-actions {
  padding: var(--margin-sm) 0;
}
</style>
