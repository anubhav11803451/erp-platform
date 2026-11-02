import type { UserCreatePayload, UserResponse, UserUpdatePayload } from '@erp/shared';
import { apiSlice } from '@/api/api-slice';

const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /domains/users
        getUsers: builder.query<UserResponse[], void>({
            query: () => '/domains/users',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'User', id }) as const),
                          { type: 'User', id: 'LIST' },
                      ]
                    : [{ type: 'User', id: 'LIST' }],
        }),
        addUser: builder.mutation<UserResponse, UserCreatePayload>({
            query: (body) => ({
                url: '/domains/users',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),
        updateUser: builder.mutation<UserResponse, { id: string; body: UserUpdatePayload }>({
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
