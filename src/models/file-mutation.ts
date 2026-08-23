export const FILE_MUTATION_OPERATION = {
  WRITE: 'write',
  RENAME: 'rename',
  DELETE: 'delete',
  CREATE_DIRECTORY: 'create-directory',
  REMOVE_DIRECTORY: 'remove-directory',
  COPY: 'copy',
} as const;

export type FileMutationOperation =
  (typeof FILE_MUTATION_OPERATION)[keyof typeof FILE_MUTATION_OPERATION];

export interface FileMutation {
  readonly operation: FileMutationOperation;
  readonly paths: readonly string[];
}

export type FileMutationListener = (mutation: FileMutation) => void;
