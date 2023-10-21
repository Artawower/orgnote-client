import { useNavigation } from './navigation-actions';
import { Router } from 'vue-router';

// TODO: master move types to external package for extensions
export interface OrgNoteApi {
  navigation: {
    openNote: (id: string) => void;
    editNote: (id: string) => void;
  };
}

export const useOrgNoteApi = (params: { router: Router }) => {
  const api: OrgNoteApi = {
    navigation: useNavigation(params.router),
  };
  return api;
};
