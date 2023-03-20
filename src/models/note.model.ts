import { MetaInfo, OrgNode } from 'org-mode-ast';
import { User } from './user.model';

export interface BaseNote {
  id: string;
  author?: User;
  meta: MetaInfo;
}

export interface Note extends BaseNote {
  content: OrgNode;
}

export interface RawNote extends BaseNote {
  content: string;
}

export interface NotesFilter {
  searchText?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
