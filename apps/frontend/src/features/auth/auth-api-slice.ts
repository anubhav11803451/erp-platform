import { apiSlice } from '@/api/api-slice';
import type { UserRole } from '@erp/db/browser';
import { logOut, setCredentials } from './auth-slice';

export type Credentials = {
    email: string;
    password: string;
};

export type RegisterBody = Credentials & {
    first_name: string;
    last_name: string;
};

export type ForgotPasswordBody = {
    email: string;
};

export type AuthResponse = {
    access_token: string;
    csrf_token: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: UserRole;
    };
};

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, Credentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials },
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data));
                } catch (_err) {
                    // Handle login error
                }
            },
        }),
        refresh: builder.mutation<AuthResponse, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'GET',
            }),
            // We must add this block to save the new tokens to state
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // Dispatch setCredentials to save the new user/tokens
                    dispatch(setCredentials(data));
                } catch (_err) {
                    // Refresh failed (e.g., cookie was invalid), do nothing
                    // The baseQueryWithReauth will dispatch logOut()
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
                    // On logout success, clear the state
                    dispatch(logOut());
                } catch (_err) {
                    // logout failed, but we clear the state
                    dispatch(logOut());
                }
            },
        }),

        register: builder.mutation<AuthResponse, RegisterBody>({
            query: (body) => ({
                url: '/auth/register', // You will need to build this endpoint
                method: 'POST',
                body,
            }),
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials(data)); // Log user in immediately
                } catch (_err) {
                    // Handle error in component
                }
            },
        }),

        // --- NEW MUTATION ---
        forgotPassword: builder.mutation<{ message: string }, ForgotPasswordBody>({
            query: (body) => ({
                url: '/auth/forgot-password', // You will need to build this endpoint
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useLoginMutation, useRefreshMutation, useLogoutMutation } = authApiSlice;
export default authApiSlice;
