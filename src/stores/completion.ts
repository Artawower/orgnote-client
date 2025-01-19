import { TXT_EXECUTE_COMMAND, type CompletionConfig, type CompletionStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useModalStore } from './modal';
import AppCompletion from 'src/containers/AppCompletion.vue';

export const useCompletionStore = defineStore<'completion-store', CompletionStore>(
  'completion-store',
  () => {
    const modal = useModalStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastModalConfig: CompletionConfig<any>;

    const open = <T>(config: CompletionConfig<T>) => {
      console.log('✎: [line 11][completion.ts<orgnote-client/src/stores>] config: ', config);
      const closed = modal.open(AppCompletion, {
        mini: true,
        noPadding: true,
        position: 'top',
        modalProps: {
          placeholder: TXT_EXECUTE_COMMAND,
          ...config,
        },
      });

      return closed.then(() => {
        lastModalConfig = config;
      });
    };

    const restore = () => {
      if (lastModalConfig) {
        open(lastModalConfig);
      }
    };
    const close = () => {};
    const closeAll = () => {};

    const store: CompletionStore = {
      restore,
      close,
      closeAll,
      open,
    };

    return store;
  },
);
