export interface GraphNoteNode {
  id: string;
  title: string;
  weight: number;
}

export interface GraphNoteLink {
  source: string;
  target: string;
}

export interface NoteGraph {
  nodes: GraphNoteNode[];
  links: GraphNoteLink[];
}
