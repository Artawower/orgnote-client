import { RouteNames } from 'src/router/routes';
import { Router } from 'vue-router';

export const useNavigation = (router: Router) => {
  const openNote = (id: string) =>
    router.push({ name: RouteNames.NoteDetail, params: { id } });
  const editNote = (id: string) =>
    router.push({ name: RouteNames.EditNote, params: { id } });

  return {
    openNote,
    editNote,
  };
};
