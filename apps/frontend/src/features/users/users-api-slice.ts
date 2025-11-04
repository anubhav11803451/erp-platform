import type { User } from '@erp/common/types';
import { apiSlice } from '@/api/api-slice';

// We can't import the backend DTO, so we'll redefine the parts we need.
// This is good practice as it decouples frontend from backend DTOs.
export type AddUserPayload = Pick<User, 'email' | 'password' | 'first_name' | 'last_name'>;
export type UpdateUserPayload = Partial<AddUserPayload>;

// We're extending the 'User' type, but for now it's the same.
// In the future, you might omit the password hash.
export type EnrichedUser = Omit<User, 'password'>;

const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /domains/users
        getUsers: builder.query<EnrichedUser[], void>({
            query: () => '/domains/users',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'User', id }) as const),
                          { type: 'User', id: 'LIST' },
                      ]
                    : [{ type: 'User', id: 'LIST' }],
        }),
        addUser: builder.mutation<EnrichedUser, AddUserPayload>({
            query: (body) => ({
                url: '/domains/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),
        updateUser: builder.mutation<EnrichedUser, { id: string; body: UpdateUserPayload }>({
            query: ({ id, body }) => ({
                url: `/domains/users/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_, __, { id }) => [{ type: 'User', id }],
        }),
        deleteUser: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/domains/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_, __, id) => [{ type: 'User', id }],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice;
