import { v4 } from 'uuid';

// TODO: master create registry of notes template
export function getInitialNoteTemplate(id?: string, title?: string): string {
  return `:PROPERTIES:
:ID: ${id ?? v4()}
:END:


#+TITLE: ${title ?? 'Untitled'}`;
}
