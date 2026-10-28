import { apiSlice } from '@/api/api-slice';
import type {
    PlatformOwnerLogoutResponse,
    PlatformOwnerSignInPayload,
    PlatformOwnerSignInResponse,
} from '@erp/shared';
import { logOut, setCredentials } from './auth-slice';

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<PlatformOwnerSignInResponse, PlatformOwnerSignInPayload>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (_error) {
                    // The sign-in form renders the request error inline.
                }
            },
        }),
        refresh: builder.mutation<PlatformOwnerSignInResponse, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (_error) {
                    dispatch(logOut());
                }
            },
        }),
        logout: builder.mutation<PlatformOwnerLogoutResponse, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    await queryFulfilled;
                } catch (_error) {
                    // Clear local credentials even if the server session has already expired.
                } finally {
                    dispatch(logOut());
                }
            },
        }),
    }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation } = authApiSlice;
export default authApiSlice;
