import { Note } from 'src/models';

export interface OrgNoteApi {
  navigation: {
    openNote: (id: string) => void;
    editNote: (id: string) => void;
  };
  interaction: {
    confirm: (title: string, message: string) => Promise<boolean>;
  };
  currentNote: {
    getCurrentNote: () => Note;
  };
  configuration: () => OrgNoteConfig;
}

// NOTE: default configs
export interface OrgNoteConfig {
  editor: {
    showSpecialSymbols: boolean;
    showPropertyDrawer: boolean;
  };
  common: {
    developerMode: boolean;
  };
  completion: {
    showGroup: boolean;
  };
}
