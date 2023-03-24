/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handlers_HttpResponse_array_models_Note_models_Pagination } from '../models/handlers_HttpResponse_array_models_Note_models_Pagination';
import type { handlers_HttpResponse_models_Note_any } from '../models/handlers_HttpResponse_models_Note_any';
import type { models_Note } from '../models/models_Note';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NotesService {

    /**
     * Get notes
     * Get all notes with optional filter
     * @param limit Limit for pagination
     * @param offset Offset for pagination
     * @param userId User ID
     * @param searchText Search text
     * @returns handlers_HttpResponse_array_models_Note_models_Pagination OK
     * @throws ApiError
     */
    public static getNotes(
        limit: string,
        offset: string,
        userId?: string,
        searchText?: string,
    ): CancelablePromise<handlers_HttpResponse_array_models_Note_models_Pagination> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/',
            query: {
                'userId': userId,
                'searchText': searchText,
                'limit': limit,
                'offset': offset,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Create note
     * Create note
     * @param note Note model
     * @returns any OK
     * @throws ApiError
     */
    public static postNotes(
        note: models_Note,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/notes/',
            body: note,
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Upsert notes
     * Bulk update or insert notes
     * @param notes Notes list
     * @returns any OK
     * @throws ApiError
     */
    public static putNotesBulkUpsert(
        notes: Array<models_Note>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/notes/bulk-upsert',
            body: notes,
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Get note
     * get note by id
     * @param id Note ID
     * @returns handlers_HttpResponse_models_Note_any OK
     * @throws ApiError
     */
    public static getNotes1(
        id: string,
    ): CancelablePromise<handlers_HttpResponse_models_Note_any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

}
