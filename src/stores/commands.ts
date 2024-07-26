import { useCompletionStore } from './completion';
import { useRecentCommandsStore } from './recent-commands-store';
import { defineStore } from 'pinia';
import { Command, CommandGroup, CompletionCandidate } from 'src/api';
import { useKeybindingStore } from 'src/stores/keybindings';
import { extractDynamicValue, mockServer } from 'src/tools';

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
    if (!commands.length) {
      return;
    }
    allCommands.value.push(
      ...commands.map((c) => ({
        ...c,
        available: c.available ?? (() => true),
      }))
    );
    registerKeybindings(allCommands.value);
  };

  const unregister = (...commands: Command[]) => {
    allCommands.value = allCommands.value.filter((c) => !commands.includes(c));
    registerKeybindings(allCommands.value);
  };

  const getCommand = (name: string) => {
    return allCommands.value.find((c) => c.command === name);
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
            icon: extractDynamicValue(c.icon) ?? 'settings',
            title: extractDynamicValue(c.title),
          }) as CompletionCandidate
      );

    const itemsGetterFn = (filter: string) => {
      const filteredCandidates = candidates.filter(
        (c) =>
          c.command.toLowerCase().includes(filter.toLowerCase()) ||
          extractDynamicValue(c.description)
            ?.toLowerCase()
            .includes(filter.toLowerCase()) ||
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
    register: mockServer(register),
    unregister: mockServer(unregister),
    getCommand,
    commands: allCommands,
    activateGroup,
    getCommandsFromGroup,
    deactivateGroup,
    initCompletion,
    currentGroups,
  };
});
