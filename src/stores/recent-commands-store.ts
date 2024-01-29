import { defineStore } from 'pinia';
import { Command } from 'src/api';

import { ref } from 'vue';

export const useRecentCommandsStore = defineStore(
  'recent-commands',
  () => {
    const recentCommands = ref<{
      [group: string]: { [commandName: string]: number };
    }>({});

    const sort = (groupName: string) => {
      return (candidateA: Command, candidateB: Command) => {
        if (
          !groupName ||
          !recentCommands.value ||
          !recentCommands.value[groupName]
        ) {
          return 0;
        }

        const usageA = recentCommands.value[groupName][candidateA.command] ?? 0;
        const usageB = recentCommands.value[groupName][candidateB.command] ?? 0;
        return usageB - usageA;
      };
    };

    const incUsage = (groupName: string, commandName: string) => {
      if (!recentCommands.value[groupName]) {
        recentCommands.value[groupName] = {};
      }

      if (!recentCommands.value[groupName][commandName]) {
        recentCommands.value[groupName][commandName] = 0;
      }

      recentCommands.value[groupName][commandName] += 1;
    };

    return {
      sort,
      incUsage,
    };
  },
  { persist: true }
);
