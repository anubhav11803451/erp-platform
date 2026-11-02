import { apiSlice } from '@/api/api-slice';
import type { SignInPayload, WorkspaceSessionResponse } from '@erp/shared';
import { authSessionResponseSchema } from '@erp/shared';
import { logOut, setCredentials } from './auth-slice';

type WorkspaceSignInPayload = Omit<SignInPayload, 'intent'> & { intent: 'WORKSPACE' };

function parseWorkspaceSession(payload: unknown): WorkspaceSessionResponse {
    const result = authSessionResponseSchema.safeParse(payload);
    if (!result.success || result.data.kind !== 'SESSION') {
        throw new Error('A workspace session could not be established.');
    }

    return result.data;
}

function sessionFromResponse(payload: unknown): WorkspaceSessionResponse {
    return parseWorkspaceSession(payload);
}

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<WorkspaceSessionResponse, WorkspaceSignInPayload>({
            query: ({ intent: _intent, ...credentials }) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials, intent: 'WORKSPACE' },
            }),
            transformResponse: sessionFromResponse,
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (_error) {
                    // The sign-in form renders the request error inline.
                }
            },
        }),
        refresh: builder.mutation<WorkspaceSessionResponse, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
            transformResponse: sessionFromResponse,
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (_error) {
                    dispatch(logOut());
                }
            },
        }),
        logout: builder.mutation<{ message: string }, void>({
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
