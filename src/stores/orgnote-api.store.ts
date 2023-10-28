import { useConfirmationModalStore } from './confirmation-modal';
import { useCurrentNoteStore } from './current-note';
import { useSettingsStore } from './settings';
import { OrgNoteApi } from 'src/api';
import { RouteNames } from 'src/router/routes';
import { Router, useRouter } from 'vue-router';

export const useOrgNoteApiStore = () => {
  const router = useRouter();

  const settings = useSettingsStore();
  const interaction = useInteraction();

  const orgNoteApi: OrgNoteApi = {
    navigation: useNavigation(router),
    currentNote: useCurrentNote(),
    interaction,
    configuration: () => settings.config,
  };

  return {
    orgNoteApi,
  };
};

const useNavigation = (router: Router) => {
  const openNote = (id: string) =>
    router.push({ name: RouteNames.NoteDetail, params: { id } });
  const editNote = (id: string) =>
    router.push({ name: RouteNames.EditNote, params: { id } });

  return {
    openNote,
    editNote,
  };
};

const useCurrentNote = (): OrgNoteApi['currentNote'] => {
  const currentNoteStore = useCurrentNoteStore();
  return {
    getCurrentNote: () => currentNoteStore.currentNote,
  };
};

const useInteraction = (): OrgNoteApi['interaction'] => {
  const confirmationModalStore = useConfirmationModalStore();
  return {
    confirm: confirmationModalStore.confirm,
  };
};
