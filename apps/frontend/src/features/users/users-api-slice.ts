import type { User } from '@erp/common/types';
import { apiSlice } from '@/api/api-slice';

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
        // ... we can add addUser, updateUser, deleteUser later
    }),
});

export const { useGetUsersQuery } = usersApiSlice;
