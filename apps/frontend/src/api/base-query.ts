import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/root-reducer';
import { Mutex } from 'async-mutex';
import Cookies from 'js-cookie';
import { authSessionResponseSchema } from '@erp/shared';
import { logOut, selectAccessToken, setCredentials } from '@/features/auth/auth-slice';
import { CSRF_TOKEN_COOKIE_NAME } from '@/lib/constants';

const mutex = new Mutex();

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1/api';

const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
        const token = selectAccessToken(getState() as RootState);
        if (token && endpoint !== 'login') {
            headers.set('authorization', `Bearer ${token}`);
        }

        if (endpoint !== 'login') {
            const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
            if (csrfToken) {
                headers.set('x-csrf-token', csrfToken);
            }
        }

        return headers;
    },
});

export const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status !== 401) {
        return result;
    }

    if (api.endpoint === 'refresh') {
        api.dispatch(logOut());
        return result;
    }

    if (api.endpoint === 'login' || api.endpoint === 'logout') {
        return result;
    }

    if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
            const refreshResult = await baseQuery(
                { url: '/auth/refresh', method: 'POST' },
                api,
                extraOptions
            );

            const refreshedSession = authSessionResponseSchema.safeParse(refreshResult.data);
            if (refreshedSession.success && refreshedSession.data.kind === 'SESSION') {
                api.dispatch(setCredentials(refreshedSession.data));
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logOut());
            }
        } finally {
            release();
        }
    } else {
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
    }

    return result;
};
