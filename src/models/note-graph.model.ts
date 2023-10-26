export interface NoteGraphLink {
  source: string;
  target?: string;
}

export interface GraphNoteNode {
  id: string;
  title: string;
  weight: number;
}

export interface NoteGraph {
  links: NoteGraphLink[];
  nodes: GraphNoteNode[];
}
