import { apiSlice } from '@/api/api-slice';

export type Credentials = {
    email: string;
    password: string;
};

export type AuthResponse = {
    access_token: string;
    refresh_token: string;
};

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, Credentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials },
            }),
        }),
    }),
});

export const { useLoginMutation } = authApiSlice;
