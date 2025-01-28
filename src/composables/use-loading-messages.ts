import {
  TXT_LOADING_MESSAGE_1,
  TXT_LOADING_MESSAGE_2,
  TXT_LOADING_MESSAGE_3,
  TXT_LOADING_MESSAGE_4,
  TXT_LOADING_MESSAGE_5,
} from 'orgnote-api';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

export function useLoadingMessages(options: { messages?: string[]; timer?: number } = {}) {
  const { t } = useI18n({
    useScope: 'global',
    inheritLocale: true,
  });

  const defaultMessages = [
    t(TXT_LOADING_MESSAGE_1),
    t(TXT_LOADING_MESSAGE_2),
    t(TXT_LOADING_MESSAGE_3),
    t(TXT_LOADING_MESSAGE_4),
    t(TXT_LOADING_MESSAGE_5),
  ];

  const messages = ref<string[]>(
    options.messages && options.messages.length > 0 ? options.messages : defaultMessages,
  );
  const timer = ref<number>(options.timer || 3000);
  const currentMessage = ref<string>(messages.value[0]);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const updateMessage = () => {
    const currentIndex = messages.value.indexOf(currentMessage.value);
    const nextIndex = (currentIndex + 1) % messages.value.length;
    currentMessage.value = messages.value[nextIndex];
  };

  onMounted(() => {
    intervalId = setInterval(updateMessage, timer.value);
  });

  onUnmounted(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  return {
    currentMessage: computed(() => currentMessage.value),
    timer,
  };
}
