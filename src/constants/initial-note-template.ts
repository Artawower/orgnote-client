import { v4 } from 'uuid';

// TODO: master create registry of notes template
export function getInitialNoteTemplate(): string {
  return `:PROPERTIES:
:ID: ${v4()}
:END:


#+TITLE: Untitled`;
}
