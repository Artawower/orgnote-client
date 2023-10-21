import { Note } from 'src/models';

export interface OrgNoteApi {
  navigation: {
    openNote: (id: string) => void;
    editNote: (id: string) => void;
  };
  currentNote: {
    getCurrentNote: () => Note;
  };
  configuration: () => OrgNoteConfig;
}

// NOTE: default configs
export interface OrgNoteConfig {
  editor: {
    showSpecialChars: boolean;
  };
}
