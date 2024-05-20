import type { Note } from 'orgnote-api';
import { withDomain } from './with-domain';

export function getNotePublicUrl(note?: Note): string {
  if (!note?.meta?.published) {
    return;
  }
  return withDomain(`/detail/${note.id}`);
}
