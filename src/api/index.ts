import { Note } from 'src/models';

export interface OrgNoteApi {
  navigation: {
    openNote: (id: string) => void;
    editNote: (id: string) => void;
  };
  currentNote: {
    getCurrentNote: () => Note;
  };
}
