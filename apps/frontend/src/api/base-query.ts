import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/app/root-reducer';
// import { logOut, setCredentials } from '@/features/auth/auth-api-slice';
import { Mutex } from 'async-mutex';
import Cookies from 'js-cookie';
import type { AuthResponse } from '@/features/auth/auth-api-slice';
import { logOut, setCredentials } from '@/features/auth/auth-slice';
import { CSRF_TOKEN_COOKIE_NAME } from '@/lib/constants';

// Create a mutex to prevent multiple simultaneous refresh attempts
const mutex = new Mutex();

// Created the baseQuery with auth headers ---
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1/api',
    credentials: 'include', // This is CRITICAL for sending cookies
    prepareHeaders: (headers, { getState, endpoint }) => {
        const token = (getState() as RootState).auth.access_token;

        // 1. Add Access Token if we have one
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        // 2. Add CSRF token for all state-changing methods (non-GET)
        // We also skip it for the auth endpoints
        if (endpoint !== 'refresh' && endpoint !== 'login' && endpoint !== 'logout') {
            const csrfToken = Cookies.get(CSRF_TOKEN_COOKIE_NAME);
            if (csrfToken) {
                // Use the 'x-csrf-token' header your backend expects
                headers.set('x-csrf-token', csrfToken);
            }
        }
        return headers;
    },
});

// Created a wrapper that handles automatic re-authentication ---
export const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
    // --- FIX 1: REMOVED `await mutex.waitForUnlock()` ---
    // We don't want to wait on every single request, only on 401s.
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // 401 Unauthorized error. Try to refresh the token.

        // --- PREVENT RECURSIVE REFRESH ---
        // Check if the FAILED request was the refresh endpoint.
        // If so, logout and exit.
        if (api.endpoint === 'refresh') {
            api.dispatch(logOut());
            return result; // Return the original 401 failure
        }

        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                // --- Try to refresh ---
                const refreshResult = await baseQuery(
                    { url: '/auth/refresh', method: 'GET' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // --- Refresh Success ---
                    const authData = refreshResult.data as AuthResponse;
                    api.dispatch(setCredentials(authData));
                    // Retry the original request with new tokens
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    // --- Refresh Failed ---
                    // The refresh token is invalid. Logout the user.
                    api.dispatch(logOut());
                }
            } finally {
                // Release the mutex
                release();
            }
        } else {
            // --- FIX 1 (CONTINUED): MOVED WAIT ---
            // Was already locked, wait for the refresh to complete
            await mutex.waitForUnlock();
            // Retry the original request (which should now have new tokens)
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};
