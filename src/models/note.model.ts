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

export interface NotePreview {
  id: ModelsPublicNote['id'];
  meta: ModelsPublicNote['meta'];
  filePath: ModelsPublicNote['filePath'];
  isMy: ModelsPublicNote['isMy'];
}
