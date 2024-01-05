import { useSettingsStore } from './settings';
import { defineStore } from 'pinia';

import { computed, ref } from 'vue';

interface Log {
  mode: string;
  message: string;
  count: number;
}

export const useLoggerStore = defineStore(
  'logger',
  () => {
    const storedLogs = ref<Log[]>([]);

    const { config } = useSettingsStore();

    const init = () => {
      if (process.env.DISABLE_LOGGER) {
        return;
      }
      const availableModes: (keyof Pick<
        typeof console,
        'info' | 'log' | 'warn' | 'error' | 'debug'
      >)[] = ['info', 'warn', 'log', 'error'];

      if (config.common.developerMode) {
        availableModes.push('debug');
      }

      availableModes.forEach((mode) => {
        const defaultLogger = console[mode].bind(console);

        console[mode] = function (...args: string[]) {
          addLog(mode, args);
          defaultLogger(...args);
        };
      });

      window.addEventListener('error', function ({ error }) {
        addLog(
          'error',
          `[line: ${error.lineno}, col: ${error.colno}] mes: ${JSON.stringify(
            error.message
          )}\n\t${error.stack}`
        );
      });
    };

    const addLog = (mode: string, ...messages: unknown[]) => {
      setTimeout(() => {
        const formattedMessage = formatMessages(messages);
        addOrUpdateLog(mode, formattedMessage);
        removeOldLogs();
      }, 10);
    };

    const addOrUpdateLog = (mode: string, message: string) => {
      if (storedLogs.value[storedLogs.value.length - 1]?.message === message) {
        storedLogs.value[storedLogs.value.length - 1].count++;
        return;
      }
      storedLogs.value = [
        ...storedLogs.value,
        {
          mode,
          message,
          count: 0,
        },
      ];
    };

    const removeOldLogs = () => {
      if (storedLogs.value.length > config.common.maximumLogsCount) {
        storedLogs.value = storedLogs.value.slice(1);
      }
    };

    const formatMessages = (messages: unknown[]) => {
      const formattedContent = messages
        .map((m) => JSON.stringify(m))
        .join(', ');
      return formattedContent;
    };

    const clearLogs = () => {
      storedLogs.value = [];
    };

    const prettyLogs = computed(() => {
      return storedLogs.value
        .map(
          (l) =>
            `[${l.mode}] ${l.message} ${l.count ? '(' + l.count + ')' : ''}`
        )
        .join('\n');
    });

    return {
      init,
      logs: storedLogs,
      prettyLogs,
      clearLogs,
    };
  },
  { persist: true }
);
