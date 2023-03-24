/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handlers_HttpResponse_array_string_any } from '../models/handlers_HttpResponse_array_string_any';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TagsService {

    /**
     * Get tags
     * Return list of al registered tags
     * @returns handlers_HttpResponse_array_string_any OK
     * @throws ApiError
     */
    public static getNotesGraph(): CancelablePromise<handlers_HttpResponse_array_string_any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notes/graph',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

}
