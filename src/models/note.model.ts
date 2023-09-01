import { ModelsPublicNote } from 'src/generated/api';

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

export interface Note extends ModelsPublicNote {
  deleted?: boolean;
}
