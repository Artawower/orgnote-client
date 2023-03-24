/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { models_category } from './models_category';
import type { models_NoteHeading } from './models_NoteHeading';
import type { models_NoteLink } from './models_NoteLink';

export type models_NoteMeta = {
    category?: models_category;
    description?: string;
    externalLinks?: Array<models_NoteLink>;
    fileTags?: Array<string>;
    headings?: Array<models_NoteHeading>;
    images?: Array<string>;
    linkedArticles?: Array<models_NoteLink>;
    previewImg?: string;
    published?: boolean;
    startup?: string;
    title?: string;
};

