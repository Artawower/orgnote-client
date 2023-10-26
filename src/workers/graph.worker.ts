/// <reference lib="webworker" />
import { repositories } from '../repositories/orgnote-database';
import {
  GraphUpdatedAction,
  WorkerAction,
  WorkerEventType,
} from './graph.actions';
import {
  GraphNoteNode,
  NoteGraph,
  NoteGraphLink,
  NotePreview,
} from 'src/models';

function buildGraph(notes: NotePreview[]): NoteGraph {
  const links: NoteGraphLink[] = [];
  const nodes: { [id: string]: GraphNoteNode } = notes.reduce<{
    [id: string]: GraphNoteNode;
  }>((acc, n) => {
    acc[n.id] = {
      id: n.id,
      title: n.meta.title,
      weight: 1,
    };
    return acc;
  }, {});

  notes.forEach((note) => {
    const connectedNotesIds = Object.keys(note.meta.connectedNotes ?? {});
    connectedNotesIds.forEach((l) => {
      if (!nodes[l]) {
        return;
      }
      nodes[l].weight += 1;
      links.push({
        source: note.id,
        target: l,
      });
    });
  });

  return {
    links,
    nodes: Object.values(nodes),
  };
}

async function updateGraph() {
  const notes = await repositories.notes.getNotePreviews();
  const graph = buildGraph(notes);
  postMessage(new GraphUpdatedAction(graph));
}

const messageHandlers: {
  [key in WorkerEventType]?: (payload: WorkerAction) => Promise<void>;
} = {
  [WorkerEventType.UpdateGraph]: updateGraph,
};

onmessage = async (e) => {
  const { data } = e as { data: WorkerAction };
  await messageHandlers[data.type]?.(data);
};
