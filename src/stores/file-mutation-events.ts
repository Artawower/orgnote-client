import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import type { FileMutation, FileMutationListener } from 'src/models/file-mutation';

const listeners = new Set<FileMutationListener>();

export const emitFileMutation = (mutation: FileMutation): void => {
  listeners.forEach((listener) => {
    const result = to(listener, 'Failed to notify file mutation listener')(mutation);
    if (result.isErr()) reporter.reportError(result.error);
  });
};

export const onFileMutation = (listener: FileMutationListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
