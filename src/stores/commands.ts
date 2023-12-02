import { CompletionCandidate, useCompletionStore } from './completion';
import { useRecentCommandsStore } from './recent-commands-store';
import { defineStore } from 'pinia';
import { Command, CommandGroup } from 'src/models';
import { useKeybindingStore } from 'src/stores/keybindings';

import { computed, ref } from 'vue';

export enum COMMAND {
  openSearch = 'openSearch',
  restoreLastCompletionSession = 'restoreLastCompletionSession',
  toggleExecuteCommand = 'toggleExecuteCommand',
}

export const useCommandsStore = defineStore('commands', () => {
  const { registerKeybindings } = useKeybindingStore();

  const commandsCompletionGroup = 'commands';
  const currentGroups = ref<CommandGroup[]>([
    'global',
    'settings',
    'completion',
    'search',
    'navigation',
    'debug',
  ]);
  const allCommands = ref<Command[]>([]);

  const commands = computed(() => {
    return allCommands.value.filter((c) =>
      currentGroups.value.includes(c.group)
    );
  });

  const activateGroup = (group: CommandGroup) => {
    currentGroups.value.push(group);
  };

  const deactivateGroup = (group: CommandGroup) => {
    currentGroups.value = currentGroups.value.filter((g) => g !== group);
  };

  const register = (...commands: Command[]) => {
    allCommands.value.push(...commands);
    registerKeybindings(allCommands.value);
  };

  const getCommandsFromGroup = (group: CommandGroup): Command[] => {
    return allCommands.value.filter((c) => c.group === group);
  };

  const completionStore = useCompletionStore();
  const recentCommandsStore = useRecentCommandsStore();
  const initCompletion = () => {
    const candidates = commands.value
      .filter((c) => !c.ignorePrompt)
      .sort(recentCommandsStore.sort(commandsCompletionGroup))
      .map(
        (c) =>
          ({
            command: c.command,
            description: c.description,
            group: c.group,
            icon: c.icon ?? 'settings',
          } as CompletionCandidate)
      );

    const itemsGetterFn = (filter: string) => {
      const filteredCandidates = candidates.filter(
        (c) =>
          c.command.toLowerCase().includes(filter.toLowerCase()) ||
          c.description.toLowerCase().includes(filter.toLowerCase()) ||
          c.group?.toLowerCase().includes(filter.toLowerCase())
      );
      return {
        total: filteredCandidates.length,
        result: filteredCandidates,
      };
    };

    completionStore.initNewCompletion({
      itemsGetter: itemsGetterFn,
      placeholder: 'search command',
      onClicked: (candidate) => {
        recentCommandsStore.incUsage(
          commandsCompletionGroup,
          candidate.command
        );
      },
    });
  };

  return {
    register,
    activateGroup,
    getCommandsFromGroup,
    deactivateGroup,
    initCompletion,
  };
});
