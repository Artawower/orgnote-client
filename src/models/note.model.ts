import { Note as OriginalNote } from 'second-brain-parser/dist/parser/models';
import { User } from './user.model';

export interface Note extends OriginalNote {
  author?: User;
}

export interface NotesFilter {
  searchText?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
