import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { resolveInternalNoteUri } from 'src/utils/org-link';
import { buildNoteContent, buildNoteFilePath } from 'src/utils/create-note-from-link';
import { buildBufferUri } from 'orgnote-api';
import { to } from 'orgnote-api/utils';

const DEFAULT_SCHEME = 'file';

const createMissingNote = (
  noteId: string,
  title: string,
  currentFilePath: string,
) => {
  const filePath = buildNoteFilePath(title, currentFilePath);
  const content = buildNoteContent(noteId, title);
  return to(async () => {
    await api.core.useFileSystem().writeFile(filePath, content);
    await api.core.useFileMeta().save({ id: noteId, filePath: filePath.split('/'), title });
    return buildBufferUri(DEFAULT_SCHEME, filePath);
  }, `Failed to create note: ${noteId}`)();
};

export const useInternalLinkHandler = () => {
  const handleClick = async (noteId: string, title: string): Promise<void> => {
    const result = await resolveInternalNoteUri(noteId, api.core.useFileMeta().getById);
    if (result.isErr()) {
      reporter.reportError(result.error);
      return;
    }
    if (result.value) {
      api.core.useBufferViewer().open(result.value);
      return;
    }
    if (!api.core.useConfig().config.editor.autoCreateMissingNotes) {
      return;
    }
    const currentFilePath = api.core.useEditor().activeContext?.filePath;
    if (!currentFilePath) {
      reporter.reportError(new Error('Cannot create note: current file path unknown'));
      return;
    }
    const createResult = await createMissingNote(noteId, title, currentFilePath);
    if (createResult.isErr()) {
      reporter.reportError(createResult.error);
      return;
    }
    api.core.useBufferViewer().open(createResult._unsafeUnwrap());
  };

  return { handleClick };
};
