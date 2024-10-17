import { Command, DefaultCommands as C } from 'orgnote-api';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { camelCaseToWords } from 'src/tools';
import { convertRouterNameToCommand } from 'src/tools/route-name-to-command.tool';
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
      command: convertRouterNameToCommand(r.name),
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
      command: C.OPEN_GRAPH,
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
      command: C.OPEN_MY_NOTES,
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
      command: C.OPEN_NOTE_EDITOR,
      group: 'editor',
      icon: 'edit',
      description: 'edit current note',
      disabled: () => {
        const isNoteDetailPage = route.name === RouteNames.NoteDetail;
        return !isNoteDetailPage || !noteStore.currentNote?.isMy;
      },
      handler: () =>
        router.push({
          name: RouteNames.RawEditor,
          params: { id: noteStore.currentNote?.id },
        }),
    },
    {
      command: C.OPEN_NOTE_VIEWER,
      description: 'view current note',
      icon: 'visibility',
      disabled: () => {
        const isNoteEditPage = [
          RouteNames.EditNote,
          RouteNames.RawEditor,
        ].includes(route.name as RouteNames);

        return !isNoteEditPage;
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
