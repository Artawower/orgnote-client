import { OrgNode } from 'org-mode-ast';
import { ModelsNote } from 'src/generated/api';

export interface Note extends Omit<ModelsNote, 'content'> {
  content: OrgNode;
}

export interface NotesFilter {
  searchText?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
