import { test, expect, vi } from 'vitest';
import { getFileManagerCommands } from './file-manager';
import { DefaultCommands, I18N, type Command, type OrgNoteApi } from 'orgnote-api';

vi.mock('src/composables/create-file-completion', () => ({
  createFileCompletion: vi.fn(),
}));

vi.mock('src/utils/get-file-dir-path', () => ({
  getFileDirPath: vi.fn(),
}));

vi.mock('src/composables/file-rename-completion', () => ({
  useFileRenameCompletion: vi.fn(),
}));

type BuildMockApiOverrides = {
  fileManager?: Record<string, unknown>;
  completion?: {
    open?: ReturnType<typeof vi.fn>;
  };
  commands?: {
    execute?: ReturnType<typeof vi.fn>;
  };
  pane?: {
    activeBufferUri?: string;
  };
  editor?: {
    activeContext?: {
      filePath?: string;
    };
  };
};

const buildMockApi = (overrides: BuildMockApiOverrides = {}) => {
  const fileManager = {
    operationTargets: [],
    path: '/notes',
    files: [],
    ...overrides.fileManager,
  };

  const completion = {
    open: vi.fn(),
    ...overrides.completion,
  };

  const commands = {
    execute: vi.fn(),
    ...overrides.commands,
  };

  const pane = {
    activeBufferUri: undefined,
    ...overrides.pane,
  };

  const editor = {
    activeContext: undefined,
    ...overrides.editor,
  };

  const api: Partial<OrgNoteApi> = {
    core: {
      useFileManager: () => fileManager,
      useCompletion: () => completion,
      useCommands: () => commands,
      usePane: () => pane,
      useEditor: () => editor,
    } as unknown as OrgNoteApi['core'],
  };

  return {
    api: api as OrgNoteApi,
    fileManager,
    completion,
    commands,
  };
};

const getCommandOrThrow = (name: string): Command => {
  const command = getFileManagerCommands().find((item) => item.command === name);
  expect(command).toBeDefined();
  if (!command) {
    throw new Error(`Command not found: ${name}`);
  }
  return command;
};

test('CREATE_NOTE command calls OPEN_NOTE after successful file creation', async () => {
  const { createFileCompletion } = await import('src/composables/create-file-completion');
  const { getFileDirPath } = await import('src/utils/get-file-dir-path');

  vi.mocked(createFileCompletion).mockResolvedValue('/test/my-note.org');
  vi.mocked(getFileDirPath).mockReturnValue('/test');

  const { api, fileManager, commands } = buildMockApi({
    fileManager: { path: '' },
  });

  const createNoteCommand = getCommandOrThrow(DefaultCommands.CREATE_NOTE);
  await createNoteCommand.handler(api, { data: {}, meta: {} });

  expect(fileManager.path).toBe('/test');
  expect(commands.execute).toHaveBeenCalledWith(DefaultCommands.OPEN_NOTE, {
    path: '/test/my-note.org',
  });
});

test('CREATE_NOTE command does not call OPEN_NOTE when file creation fails', async () => {
  const { createFileCompletion } = await import('src/composables/create-file-completion');
  vi.mocked(createFileCompletion).mockResolvedValue('');

  const { api, commands } = buildMockApi({
    fileManager: { path: '' },
  });

  const createNoteCommand = getCommandOrThrow(DefaultCommands.CREATE_NOTE);
  await createNoteCommand.handler(api, { data: {}, meta: {} });

  expect(commands.execute).not.toHaveBeenCalled();
});

test('RENAME_FILE command uses path from params when provided', async () => {
  const { useFileRenameCompletion } = await import('src/composables/file-rename-completion');

  const { api } = buildMockApi({
    fileManager: { focusFile: undefined },
  });

  const renameCommand = getCommandOrThrow(DefaultCommands.RENAME_FILE);
  await renameCommand.handler(api, {
    data: { path: '/test/renamed.org' },
    meta: {},
  });

  expect(useFileRenameCompletion).toHaveBeenCalledWith(api, '/test/renamed.org');
});

test('COPY_FILE command uses path from params when provided', async () => {
  const startCopy = vi.fn();
  const { api } = buildMockApi({
    fileManager: { operationTargets: [], startCopy },
  });

  const copyCommand = getCommandOrThrow(DefaultCommands.COPY_FILE);
  await copyCommand.handler(api, {
    data: { path: '/test/copied.org' },
    meta: {},
  });

  expect(startCopy).toHaveBeenCalledWith(['/test/copied.org']);
});

test('MOVE_FILE command uses paths from params when provided', async () => {
  const startMove = vi.fn();
  const { api } = buildMockApi({
    fileManager: { operationTargets: [], startMove },
  });

  const moveCommand = getCommandOrThrow(DefaultCommands.MOVE_FILE);
  await moveCommand.handler(api, {
    data: { paths: ['/test/moved.org'] },
    meta: {},
  });

  expect(startMove).toHaveBeenCalledWith(['/test/moved.org']);
});

test('COPY_FILE command executes pending operation in interactive mode', async () => {
  const startCopy = vi.fn();
  const executePending = vi.fn();
  const cancelPending = vi.fn();
  const open = vi.fn().mockResolvedValue('/dest');

  const { api, completion } = buildMockApi({
    fileManager: {
      operationTargets: [],
      path: '/notes',
      pendingOperation: { type: 'copy', paths: ['/test/copied.org'] },
      startCopy,
      executePending,
      cancelPending,
    },
    completion: { open },
  });

  const copyCommand = getCommandOrThrow(DefaultCommands.COPY_FILE);
  await copyCommand.handler(api, {
    data: { path: '/test/copied.org', interactive: true },
    meta: {},
  });

  expect(startCopy).toHaveBeenCalledWith(['/test/copied.org']);
  expect(completion.open).toHaveBeenCalledWith({
    type: 'input',
    searchText: '/notes',
    placeholder: I18N.PICK_FOLDER,
  });
  expect(executePending).toHaveBeenCalledWith('/dest');
  expect(cancelPending).not.toHaveBeenCalled();
});

test('MOVE_FILE command cancels pending operation when interactive path is empty', async () => {
  const startMove = vi.fn();
  const executePending = vi.fn();
  const cancelPending = vi.fn();
  const open = vi.fn().mockResolvedValue('');

  const { api } = buildMockApi({
    fileManager: {
      operationTargets: [],
      path: '/notes',
      pendingOperation: { type: 'move', paths: ['/test/moved.org'] },
      startMove,
      executePending,
      cancelPending,
    },
    completion: { open },
  });

  const moveCommand = getCommandOrThrow(DefaultCommands.MOVE_FILE);
  await moveCommand.handler(api, {
    data: { path: '/test/moved.org', interactive: true },
    meta: {},
  });

  expect(startMove).toHaveBeenCalledWith(['/test/moved.org']);
  expect(executePending).not.toHaveBeenCalled();
  expect(cancelPending).toHaveBeenCalled();
});

test('MOVE_FILE command executes pending operation in interactive mode', async () => {
  const startMove = vi.fn();
  const executePending = vi.fn();
  const cancelPending = vi.fn();
  const open = vi.fn().mockResolvedValue('/dest');

  const { api } = buildMockApi({
    fileManager: {
      operationTargets: [],
      path: '/notes',
      pendingOperation: { type: 'move', paths: ['/test/moved.org'] },
      startMove,
      executePending,
      cancelPending,
    },
    completion: { open },
  });

  const moveCommand = getCommandOrThrow(DefaultCommands.MOVE_FILE);
  await moveCommand.handler(api, {
    data: { path: '/test/moved.org', interactive: true },
    meta: {},
  });

  expect(startMove).toHaveBeenCalledWith(['/test/moved.org']);
  expect(executePending).toHaveBeenCalledWith('/dest');
  expect(cancelPending).not.toHaveBeenCalled();
});

test('COPY_FILE command cancels pending operation when interactive path is empty', async () => {
  const startCopy = vi.fn();
  const executePending = vi.fn();
  const cancelPending = vi.fn();
  const open = vi.fn().mockResolvedValue('');

  const { api } = buildMockApi({
    fileManager: {
      operationTargets: [],
      path: '/notes',
      pendingOperation: { type: 'copy', paths: ['/test/copied.org'] },
      startCopy,
      executePending,
      cancelPending,
    },
    completion: { open },
  });

  const copyCommand = getCommandOrThrow(DefaultCommands.COPY_FILE);
  await copyCommand.handler(api, {
    data: { path: '/test/copied.org', interactive: true },
    meta: {},
  });

  expect(startCopy).toHaveBeenCalledWith(['/test/copied.org']);
  expect(executePending).not.toHaveBeenCalled();
  expect(cancelPending).toHaveBeenCalled();
});

test('COPY_FILE command does nothing when no targets available', async () => {
  const startCopy = vi.fn();
  const { api, completion } = buildMockApi({
    fileManager: {
      operationTargets: [],
      startCopy,
    },
  });

  const copyCommand = getCommandOrThrow(DefaultCommands.COPY_FILE);
  await copyCommand.handler(api, {
    data: {},
    meta: {},
  });

  expect(startCopy).not.toHaveBeenCalled();
  expect(completion.open).not.toHaveBeenCalled();
});

test('MOVE_FILE command does nothing when no targets available', async () => {
  const startMove = vi.fn();
  const { api, completion } = buildMockApi({
    fileManager: {
      operationTargets: [],
      startMove,
    },
  });

  const moveCommand = getCommandOrThrow(DefaultCommands.MOVE_FILE);
  await moveCommand.handler(api, {
    data: {},
    meta: {},
  });

  expect(startMove).not.toHaveBeenCalled();
  expect(completion.open).not.toHaveBeenCalled();
});

test('COPY_FILE command cancels pending operation when interactive completion fails', async () => {
  const startCopy = vi.fn();
  const executePending = vi.fn();
  const cancelPending = vi.fn();
  const open = vi.fn().mockRejectedValue(new Error('completion failed'));

  const { api } = buildMockApi({
    fileManager: {
      operationTargets: [],
      path: '/notes',
      pendingOperation: { type: 'copy', paths: ['/test/copied.org'] },
      startCopy,
      executePending,
      cancelPending,
    },
    completion: { open },
  });

  const copyCommand = getCommandOrThrow(DefaultCommands.COPY_FILE);

  await expect(
    copyCommand.handler(api, {
      data: { path: '/test/copied.org', interactive: true },
      meta: {},
    }),
  ).rejects.toThrow('Failed to pick destination');

  expect(startCopy).toHaveBeenCalledWith(['/test/copied.org']);
  expect(executePending).not.toHaveBeenCalled();
  expect(cancelPending).toHaveBeenCalled();
});

test('RENAME_FILE command reopens active note with new path', async () => {
  const { useFileRenameCompletion } = await import('src/composables/file-rename-completion');
  vi.mocked(useFileRenameCompletion).mockResolvedValue('/test/renamed.org');

  const execute = vi.fn();
  const { api } = buildMockApi({
    fileManager: { focusFile: undefined },
    pane: { activeBufferUri: 'file:///test/old.org' },
    commands: { execute },
  });

  const renameCommand = getCommandOrThrow(DefaultCommands.RENAME_FILE);
  await renameCommand.handler(api, {
    data: { path: '/test/old.org' },
    meta: {},
  });

  expect(execute).toHaveBeenCalledWith(DefaultCommands.OPEN_NOTE, { path: '/test/renamed.org' });
});

test('EXECUTE_PENDING_FILE_OPERATION reopens active moved note', async () => {
  const executePending = vi.fn();
  const execute = vi.fn();

  const { api } = buildMockApi({
    fileManager: {
      path: '/dest',
      pendingOperation: { type: 'move', paths: ['/test/old.org'] },
      executePending,
    },
    pane: { activeBufferUri: 'file:///test/old.org' },
    commands: { execute },
  });

  const executePendingCommand = getCommandOrThrow(DefaultCommands.EXECUTE_PENDING_FILE_OPERATION);
  await executePendingCommand.handler(api, { data: {}, meta: {} });

  expect(executePending).toHaveBeenCalledWith('/dest');
  expect(execute).toHaveBeenCalledWith(DefaultCommands.OPEN_NOTE, { path: '/dest/old.org' });
});
