import type { Command } from 'orgnote-api';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { convertRouterNameToCommand } from 'src/utils/route-name-to-command';
import { type Router, useRouter } from 'vue-router';

export function getRoutesCommands(router?: Router): Command[] {
  router ??= useRouter();
  const routesCommands: Command[] = router
    .getRoutes()
    // TODO: master tmp hack for avoid routes with params. Adapt to user input.
    .filter((r) => r.name && !r.path.includes(':') && r?.meta?.programmaticalNavigation !== false)
    .map((r) => ({
      command: convertRouterNameToCommand(r.name),
      title: camelCaseToWords(r.name.toString()),
      description: `Open ${r.name.toString()}`,
      group: 'navigation',
      icon: (r.meta?.icon as string) ?? 'assistant_navigation',
      handler: () => router.push({ name: r.name }),
    }));

  return routesCommands;
}
