<template>
  <div class="progress-dots">
    <span
      v-for="step in totalSteps"
      :key="step"
      class="dot"
      :class="dotClass(step - 1)"
    />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  totalSteps: number;
  currentStep: number;
}>();

const dotClass = (index: number): string => {
  if (index === props.currentStep) return 'active';
  if (index < props.currentStep) return 'completed';
  return 'upcoming';
};
</script>

<style lang="scss" scoped>
.progress-dots {
  display: flex;
  justify-content: center;
  gap: var(--gap-sm);
  padding: var(--margin-sm) 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &.active {
    background: var(--accent);
  }

  &.completed {
    background: var(--fg-muted);
  }

  &.upcoming {
    background: transparent;
    border: 2px solid var(--fg-muted);
  }
}
</style>
