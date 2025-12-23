import { test, expect, vi } from 'vitest';
import { getFileManagerCommands } from './file-manager';
import { DefaultCommands } from 'orgnote-api';
import type { OrgNoteApi } from 'orgnote-api';
import { isNullable } from 'orgnote-api/utils';

vi.mock('src/composables/create-file-completion', () => ({
  createFileCompletion: vi.fn(),
}));

vi.mock('src/utils/get-file-dir-path', () => ({
  getFileDirPath: vi.fn(),
}));

test('CREATE_NOTE command calls OPEN_NOTE after successful file creation', async () => {
  const { createFileCompletion } = await import('src/composables/create-file-completion');
  const { getFileDirPath } = await import('src/utils/get-file-dir-path');

  const mockFilePath = '/test/my-note.org';
  const mockDirPath = '/test';

  vi.mocked(createFileCompletion).mockResolvedValue(mockFilePath);
  vi.mocked(getFileDirPath).mockReturnValue(mockDirPath);

  const mockFileManager = { path: '' };
  const mockCommands = { execute: vi.fn() };

  const mockApi: Partial<OrgNoteApi> = {
    core: {
      useFileManager: () => mockFileManager,
      useCommands: () => mockCommands,
    } as unknown as OrgNoteApi['core'],
  };

  const commands = getFileManagerCommands();
  const createNoteCommand = commands.find((cmd) => cmd.command === DefaultCommands.CREATE_NOTE);

  expect(createNoteCommand).toBeDefined();
  if (isNullable(createNoteCommand)) return;

  await createNoteCommand.handler(mockApi as OrgNoteApi, { data: {}, meta: {} });

  expect(mockFileManager.path).toBe(mockDirPath);
  expect(mockCommands.execute).toHaveBeenCalledWith(DefaultCommands.OPEN_NOTE, {
    path: mockFilePath,
  });
});

test('CREATE_NOTE command does not call OPEN_NOTE when file creation fails', async () => {
  const { createFileCompletion } = await import('src/composables/create-file-completion');

  vi.mocked(createFileCompletion).mockResolvedValue('');

  const mockCommands = { execute: vi.fn() };

  const mockApi: Partial<OrgNoteApi> = {
    core: {
      useFileManager: () => ({ path: '' }),
      useCommands: () => mockCommands,
    } as unknown as OrgNoteApi['core'],
  };

  const commands = getFileManagerCommands();
  const createNoteCommand = commands.find((cmd) => cmd.command === DefaultCommands.CREATE_NOTE);

  if (isNullable(createNoteCommand)) return;

  await createNoteCommand.handler(mockApi as OrgNoteApi, { data: {}, meta: {} });

  expect(mockCommands.execute).not.toHaveBeenCalled();
});


