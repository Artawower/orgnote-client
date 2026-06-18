import type {
  Command,
  Extension,
  OrgNoteApi,
  CompletionCandidate,
} from 'orgnote-api';
import { toRef, watch } from 'vue';
import { to } from 'orgnote-api/utils';
import { getCandidateTitle } from 'src/utils/completion-candidate-title';

const HISTORY_KEY = 'command-history';
const COMMANDS_COMPLETION_NAME = 'commands';

type CommandHistory = Record<string, string>;

const loadHistory = async (api: OrgNoteApi): Promise<CommandHistory> => {
  const kvRepo = api.infrastructure.keyValueRepository;
  const content = await kvRepo.get(HISTORY_KEY);
  if (!content) return {};

  const parsed = to(JSON.parse)(content);
  if (parsed.isErr()) return {};
  return parsed.value as CommandHistory;
};

const saveHistory = async (
  api: OrgNoteApi,
  history: CommandHistory,
): Promise<void> => {
  const kvRepo = api.infrastructure.keyValueRepository;
  await kvRepo.set(HISTORY_KEY, JSON.stringify(history, null, 2));
};

const trackCommandUsage = async (
  api: OrgNoteApi,
  commandName: string,
): Promise<void> => {
  const history = await loadHistory(api);
  history[commandName] = new Date().toISOString();
  await saveHistory(api, history);
};

const hasSearchQuery = (searchQuery: string): boolean => searchQuery.trim().length > 0;

const sortCandidatesByRecentThenAlphabetically = (
  candidates: CompletionCandidate<Command>[],
  history: CommandHistory,
): CompletionCandidate<Command>[] =>
  [...candidates].sort((a, b) => {
    const aCommand = a.data.command;
    const bCommand = b.data.command;
    const aLastUsed = aCommand ? history[aCommand] : undefined;
    const bLastUsed = bCommand ? history[bCommand] : undefined;

    if (aLastUsed && bLastUsed) {
      return new Date(bLastUsed).getTime() - new Date(aLastUsed).getTime();
    }

    if (aLastUsed && !bLastUsed) return -1;
    if (!aLastUsed && bLastUsed) return 1;

    return getCandidateTitle(a).localeCompare(getCandidateTitle(b));
  });

const cleanupByApi = new Map<OrgNoteApi, () => void>();

const registerAfterExecuteHandlers = (
  api: OrgNoteApi,
  commandsStore: ReturnType<OrgNoteApi['core']['useCommands']>,
  commands: Command[],
  registered: Map<string, () => void>,
): void => {
  const commandNames = commands
    .map((command) => command.command)
    .filter((name): name is string => Boolean(name));
  const nextNames = new Set(commandNames);

  registered.forEach((unregister, name) => {
    if (nextNames.has(name)) return;
    unregister();
    registered.delete(name);
  });

  commandNames.forEach((name) => {
    if (registered.has(name)) return;
    const unregister = commandsStore.afterExecute(name, async (command, _, options) => {
      if (!options?.interactive) return;
      if (!command.command) return;
      await trackCommandUsage(api, command.command);
    });
    registered.set(name, unregister);
  });
};

export const commandHistoryExtension: Extension = {
  onMounted: async (api) => {
    const existingCleanup = cleanupByApi.get(api);
    if (existingCleanup) {
      existingCleanup();
      cleanupByApi.delete(api);
    }

    const completion = api.core.useCompletion();
    const commandsStore = api.core.useCommands();
    const registered = new Map<string, () => void>();

    const unregisterInterceptor = completion.registerInterceptor<Command>({
      name: 'command-history-sorter',
      target: COMMANDS_COMPLETION_NAME,
      priority: 100,
      handler: async (candidates, context) => {
        if (hasSearchQuery(context.searchQuery)) return candidates;
        const history = await loadHistory(api);
        return sortCandidatesByRecentThenAlphabetically(candidates, history);
      },
    });

    const commandsRef = toRef(commandsStore, 'commands');

    const stopCommandsWatch = watch(
      commandsRef,
      (nextCommands) =>
        registerAfterExecuteHandlers(api, commandsStore, nextCommands, registered),
      { immediate: true },
    );

    const unregisterAfterExecute = () => {
      registered.forEach((unregister) => unregister());
      registered.clear();
    };

    const cleanup = () => {
      unregisterInterceptor();
      unregisterAfterExecute();
      stopCommandsWatch();
    };

    cleanupByApi.set(api, cleanup);
  },

  onUnmounted: async (api) => {
    const cleanup = cleanupByApi.get(api);
    if (!cleanup) return;
    cleanup();
    cleanupByApi.delete(api);
  },
};

export { commandHistoryManifest } from './manifest';
