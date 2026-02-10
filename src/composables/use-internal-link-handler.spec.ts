import { test, expect, vi, beforeEach } from 'vitest';

const {
  mockGetById,
  mockWriteFile,
  mockSave,
  mockOpen,
  mockReportError,
} = vi.hoisted(() => ({
  mockGetById: vi.fn(),
  mockWriteFile: vi.fn(),
  mockSave: vi.fn(),
  mockOpen: vi.fn(),
  mockReportError: vi.fn(),
}));

let mockActiveContext: { filePath?: string } | null = null;

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileMeta: () => ({
        getById: mockGetById,
        save: mockSave,
      }),
      useFileSystem: () => ({
        writeFile: mockWriteFile,
      }),
      useBufferViewer: () => ({
        open: mockOpen,
      }),
      useEditor: () => ({
        get activeContext() {
          return mockActiveContext;
        },
      }),
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: mockReportError,
  },
}));

import { useInternalLinkHandler } from './use-internal-link-handler';

beforeEach(() => {
  vi.clearAllMocks();
  mockActiveContext = { filePath: 'notes/current.org' };
  mockGetById.mockResolvedValue({ filePath: ['notes', 'existing.org'] });
  mockWriteFile.mockResolvedValue(undefined);
  mockSave.mockResolvedValue(undefined);
});

test('useInternalLinkHandler handleClick opens existing note when found', async () => {
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc-123', 'My Note');
  expect(mockOpen).toHaveBeenCalledWith('file://notes/existing.org');
  expect(mockWriteFile).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick creates and opens note when not found', async () => {
  mockGetById.mockResolvedValue(undefined);
  const { handleClick } = useInternalLinkHandler();
  await handleClick('new-id', 'New Note');
  expect(mockWriteFile).toHaveBeenCalledOnce();
  expect(mockSave).toHaveBeenCalledOnce();
  expect(mockOpen).toHaveBeenCalledOnce();
});

test('useInternalLinkHandler handleClick writes correct content when creating note', async () => {
  mockGetById.mockResolvedValue(undefined);
  const { handleClick } = useInternalLinkHandler();
  await handleClick('test-id', 'Test Title');
  const content = mockWriteFile.mock.calls[0]?.[1] as string;
  expect(content).toContain(':ID: test-id');
  expect(content).toContain('#+TITLE: Test Title');
});

test('useInternalLinkHandler handleClick saves meta with correct data when creating note', async () => {
  mockGetById.mockResolvedValue(undefined);
  const { handleClick } = useInternalLinkHandler();
  await handleClick('my-id', 'My Title');
  expect(mockSave).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'my-id', title: 'My Title' }),
  );
  const meta = mockSave.mock.calls[0]?.[0] as { filePath: string[] };
  expect(meta.filePath).toEqual(expect.arrayContaining(['notes']));
});

test('useInternalLinkHandler handleClick reports error when resolve fails', async () => {
  mockGetById.mockRejectedValue(new Error('DB error'));
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc', 'Title');
  expect(mockReportError).toHaveBeenCalledOnce();
  expect(mockOpen).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick reports error when no current file path', async () => {
  mockGetById.mockResolvedValue(undefined);
  mockActiveContext = { filePath: undefined };
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc', 'Title');
  expect(mockReportError).toHaveBeenCalledOnce();
  expect(mockWriteFile).not.toHaveBeenCalled();
  expect(mockOpen).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick reports error when activeContext is null', async () => {
  mockGetById.mockResolvedValue(undefined);
  mockActiveContext = null;
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc', 'Title');
  expect(mockReportError).toHaveBeenCalledOnce();
  expect(mockWriteFile).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick reports error when note creation fails', async () => {
  mockGetById.mockResolvedValue(undefined);
  mockWriteFile.mockRejectedValue(new Error('Disk full'));
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc', 'Title');
  expect(mockReportError).toHaveBeenCalledOnce();
  expect(mockOpen).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick does not create when existing note found', async () => {
  const { handleClick } = useInternalLinkHandler();
  await handleClick('abc', 'Title');
  expect(mockWriteFile).not.toHaveBeenCalled();
  expect(mockSave).not.toHaveBeenCalled();
});

test('useInternalLinkHandler handleClick opens created note buffer URI', async () => {
  mockGetById.mockResolvedValue(undefined);
  const { handleClick } = useInternalLinkHandler();
  await handleClick('new-id', 'Created Note');
  const uri = mockOpen.mock.calls[0]?.[0] as string;
  expect(uri).toContain('file://');
  expect(uri).toMatch(/Created Note/);
});
