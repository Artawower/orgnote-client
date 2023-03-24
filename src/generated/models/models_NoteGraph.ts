/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { models_GraphNoteLink } from './models_GraphNoteLink';
import type { models_GraphNoteNode } from './models_GraphNoteNode';

export type models_NoteGraph = {
    links?: Array<models_GraphNoteLink>;
    nodes?: Array<models_GraphNoteNode>;
};

