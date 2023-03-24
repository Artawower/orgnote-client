import { OrgNode } from 'org-mode-ast';
import { ModelsPublicNote } from 'src/generated/api';

export interface Note extends Omit<ModelsPublicNote, 'content'> {
  content: OrgNode;
}

export interface NotesFilter {
  searchText?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
