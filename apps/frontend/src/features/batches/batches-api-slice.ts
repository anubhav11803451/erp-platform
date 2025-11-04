import type { Batch, User } from '@erp/common/types';
import { apiSlice } from '@/api/api-slice';

// This is the type we expect from the backend (with tutor data included)
export type EnrichedBatch = Batch & {
    tutor: User | null;
};

// Types for our "create" and "update" mutations
export type CreateBatchInput = {
    name: string;
    subject?: string;
    tutorId?: string;
};

export type UpdateBatchInput = Partial<CreateBatchInput>;

const batchesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /domains/batches
        getBatches: builder.query<EnrichedBatch[], void>({
            query: () => '/domains/batches',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'Batch', id }) as const),
                          { type: 'Batch', id: 'LIST' },
                      ]
                    : [{ type: 'Batch', id: 'LIST' }],
        }),

        getBatch: builder.query<EnrichedBatch, string>({
            query: (id) => `/domains/batches/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Batch', id }],
        }),

        // POST /domains/batches
        addBatch: builder.mutation<Batch, CreateBatchInput>({
            query: (body) => ({
                url: '/domains/batches',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Batch', id: 'LIST' }],
        }),

        // PATCH /domains/batches/:id
        updateBatch: builder.mutation<Batch, { id: string; body: UpdateBatchInput }>({
            query: ({ id, body }) => ({
                url: `/domains/batches/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Batch', id },
                { type: 'Batch', id: 'LIST' },
            ],
        }),

        // DELETE /domains/batches/:id
        deleteBatch: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/domains/batches/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Batch', id },
                { type: 'Batch', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetBatchQuery,
    useGetBatchesQuery,
    useAddBatchMutation,
    useUpdateBatchMutation,
    useDeleteBatchMutation,
} = batchesApiSlice;
