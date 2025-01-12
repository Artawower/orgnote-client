import {
  LOADING_MESSAGE_1,
  LOADING_MESSAGE_2,
  LOADING_MESSAGE_3,
  LOADING_MESSAGE_4,
  LOADING_MESSAGE_5,
} from 'orgnote-api';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

export function useLoadingMessages(options: { messages?: string[]; timer?: number } = {}) {
  const { t } = useI18n({
    useScope: 'global',
    inheritLocale: true,
  });

  const defaultMessages = [
    t(LOADING_MESSAGE_1),
    t(LOADING_MESSAGE_2),
    t(LOADING_MESSAGE_3),
    t(LOADING_MESSAGE_4),
    t(LOADING_MESSAGE_5),
  ];

  const messages = ref<string[]>(
    options.messages && options.messages.length > 0 ? options.messages : defaultMessages,
  );
  const timer = ref<number>(options.timer || 3000);
  const currentMessage = ref<string>(messages.value[0]);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const updateMessage = () => {
    console.log('[line 30]: UPDATE?');
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
      console.log('[line 45]: CLEAR TIMER');
    }
  });

  return {
    currentMessage: computed(() => currentMessage.value),
    timer,
  };
}
