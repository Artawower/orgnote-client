import { Command } from 'orgnote-api';
import { RouteNames } from 'src/router/routes';
import { useAuthStore, useCurrentNoteStore } from 'src/stores';
import { camelCaseToWords } from 'src/tools';
import { useRoute, useRouter } from 'vue-router';

export function getRoutesCommands(): Command[] {
  const router = useRouter();
  const authStore = useAuthStore();
  const routesCommands: Command[] = router
    .getRoutes()
    // TODO: master tmp hack for avoid routes with params. Adapt to user input.
    .filter(
      (r) =>
        r.name &&
        !r.path.includes(':') &&
        r?.meta?.programmaticalNavigation !== false
    )
    .map((r) => ({
      command: camelCaseToWords(r.name.toString()).toLocaleLowerCase(),
      title: camelCaseToWords(r.name.toString()),
      description: `Open ${r.name.toString()}`,
      group: 'navigation',
      icon: (r.meta?.icon as string) ?? 'assistant_navigation',
      handler: () => router.push({ name: r.name }),
    }));

  const noteStore = useCurrentNoteStore();
  const route = useRoute();

  routesCommands.push(
    {
      command: 'graph',
      title: 'Graph',
      description: 'Open Graph',
      group: 'navigation',
      icon: 'hub',
      handler: () =>
        router.push({
          name: RouteNames.UserGraph,
          params: { userId: authStore.user.id },
        }),
    },
    {
      command: 'my notes',
      title: 'My Notes',
      description: 'Open My Notes',
      group: 'navigation',
      icon: 'home',
      handler: () =>
        router.push({
          name: RouteNames.UserNotes,
          params: { userId: authStore.user.id },
        }),
    },
    {
      command: 'edit mode',
      group: 'editor',
      icon: 'edit',
      description: 'edit current note',
      available: () => {
        const isNoteDetailPage = route.name == RouteNames.NoteDetail;

        return isNoteDetailPage && noteStore.currentNote?.isMy;
      },
      handler: () =>
        router.push({
          name: RouteNames.RawEditor,
          params: { id: noteStore.currentNote?.id },
        }),
    },
    {
      command: 'view mode',
      description: 'view current note',
      icon: 'visibility',
      available: () => {
        const isNoteEditPage = [
          RouteNames.EditNote,
          RouteNames.RawEditor,
        ].includes(route.name as RouteNames);
        return isNoteEditPage;
      },
      handler: () => {
        router.push({
          name: RouteNames.NoteDetail,
          params: { id: noteStore.currentNote?.id },
        });
      },
    }
  );
  return routesCommands;
}
