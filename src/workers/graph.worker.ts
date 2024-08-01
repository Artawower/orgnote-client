/// <reference lib="webworker" />
import { GraphUpdated, GraphAction, GraphWorkerEvent } from './graph.actions';
import { GraphNoteNode, NoteGraph, NoteGraphLink } from 'src/models';
import { repositories } from 'src/boot/repositories';
import { NotePreview } from 'orgnote-api';

function buildGraph(notes: NotePreview[]): NoteGraph {
  const links: NoteGraphLink[] = [];
  const nodes: { [id: string]: GraphNoteNode } = notes.reduce<{
    [id: string]: GraphNoteNode;
  }>((acc, n) => {
    acc[n.id] = {
      id: n.id,
      title: n.encrypted ? n.filePath.slice(-1).join('') : n.meta.title,
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
  postMessage(new GraphUpdated(graph));
}

const messageHandlers: {
  [key in GraphWorkerEvent]?: (payload: GraphAction) => Promise<void>;
} = {
  [GraphWorkerEvent.UpdateGraph]: updateGraph,
};

onmessage = async (e) => {
  const { data } = e as { data: GraphAction };
  await messageHandlers[data.type]?.(data);
};
