import { useSettingsStore } from './settings';
import { defineStore } from 'pinia';

import { computed, ref } from 'vue';

export const userLoggerStore = defineStore('logger', () => {
  const logs = ref<string[]>([]);

  const { config } = useSettingsStore();

  const addLog = (mode: string, message?: string) => {
    const formattedMessage = formatMessage(mode, message);
    logs.value = [...logs.value, formattedMessage];
    if (logs.value.length > config.common.maximumLogsCount) {
      logs.value = logs.value.slice(1);
    }
  };

  const formatMessage = (mode: string, message?: string) =>
    `[${mode.toUpperCase()}] ${message}`;

  const init = () => {
    const availableModes: (keyof Pick<
      typeof console,
      'info' | 'log' | 'warn' | 'error'
    >)[] = ['info', 'warn', 'log', 'error'];

    availableModes.forEach((mode) => {
      const defaultLogger = console[mode].bind(console);

      console[mode] = function (...args: string[]) {
        addLog(mode, args[0]);
        defaultLogger(...args);
      };
    });

    window.onerror = function (message, source, lineno, colno, error) {
      addLog(
        'error',
        `[line: ${lineno}, col: ${colno}] ${message}\n\t${source}\n\t${error}`
      );
    };
  };

  const prettyLogs = computed(() => {
    return logs.value.join('\n');
  });

  return {
    init,
    logs,
    prettyLogs,
  };
});
