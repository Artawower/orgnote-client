/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { models_NoteMeta } from './models_NoteMeta';

export type models_Note = {
    authorId?: string;
    content?: string;
    createdAt?: string;
    id?: string;
    likes?: number;
    meta?: models_NoteMeta;
    updatedAt?: string;
    views?: number;
};

