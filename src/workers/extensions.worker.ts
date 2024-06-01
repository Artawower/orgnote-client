/// <reference lib="webworker" />
 

import { refreshPackages } from 'src/tools';
import {
  ExtensionsWorkerEvent,
  ExtensionsWorkerAction,
  RefreshExtensions,
} from './extensions.actions';

// TODO: master doesn't work cause git process requires window object.
// Check with other solution later.

const messageHandlers: {
  [key in ExtensionsWorkerEvent]?: (
    action: ExtensionsWorkerAction
  ) => Promise<void>;
} = {
  [ExtensionsWorkerEvent.RefreshAll]: refreshAllPackages,
};

async function refreshAllPackages(
  action: ExtensionsWorkerAction
): Promise<void> {
  const sources = (action as RefreshExtensions).sources;
  await refreshPackages(sources);
  postMessage({ type: ExtensionsWorkerEvent.Refreshed });
  return;
}

onmessage = async (e) => {
  const { data } = e as { data: ExtensionsWorkerAction };
  await messageHandlers[data.type]?.(data);
};
