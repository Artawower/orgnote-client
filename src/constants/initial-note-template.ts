import { v4 } from 'uuid';
export function getInitialNoteTemplate(): string {
  return `:PROPERTIES:
:ID: ${v4()}
:END:


#+TITLE: `;
}
