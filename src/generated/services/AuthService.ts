/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { handlers_HttpResponse_array_models_APIToken_any } from '../models/handlers_HttpResponse_array_models_APIToken_any';
import type { handlers_HttpResponse_handlers_OAuthRedirectData_any } from '../models/handlers_HttpResponse_handlers_OAuthRedirectData_any';
import type { handlers_HttpResponse_models_PublicUser_any } from '../models/handlers_HttpResponse_models_PublicUser_any';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Get API tokens
     * Return all available API tokens
     * @returns handlers_HttpResponse_array_models_APIToken_any OK
     * @throws ApiError
     */
    public static getAuthApiTokens(): CancelablePromise<handlers_HttpResponse_array_models_APIToken_any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/api-tokens',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Callback for github OAuth
     * @returns any OK
     * @throws ApiError
     */
    public static getAuthGithubCallback(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/github/callback',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Login
     * Entrypoint for login
     * @returns handlers_HttpResponse_handlers_OAuthRedirectData_any OK
     * @throws ApiError
     */
    public static getAuthGithubLogin(): CancelablePromise<handlers_HttpResponse_handlers_OAuthRedirectData_any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/github/login',
            errors: {
                400: `Bad Request`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Logout
     * @returns any OK
     * @throws ApiError
     */
    public static getAuthLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/logout',
            errors: {
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Delete API token
     * Delete API token
     * @returns any OK
     * @throws ApiError
     */
    public static deleteAuthToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/auth/token',
            errors: {
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Verify user
     * Return found user by provided token
     * @returns handlers_HttpResponse_models_PublicUser_any OK
     * @throws ApiError
     */
    public static getAuthVerify(): CancelablePromise<handlers_HttpResponse_models_PublicUser_any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/verify',
            errors: {
                403: `Forbidden`,
                500: `Internal Server Error`,
            },
        });
    }

}
