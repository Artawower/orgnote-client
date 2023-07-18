import { OrgNode } from 'org-mode-ast';
import { ModelsPublicNote } from 'src/generated/api';

export interface Note extends Omit<Partial<ModelsPublicNote>, 'content'> {
  content: OrgNode;
  isMyNote: boolean;
}

export interface NotesFilter {
  searchText?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
