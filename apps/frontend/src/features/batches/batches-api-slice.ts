import type {
    BatchCreatePayload,
    BatchUpdatePayload,
    BatchResponse,
    EnrichedBatch,
} from '@erp/shared';
import { apiSlice } from '@/api/api-slice';

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
        addBatch: builder.mutation<BatchResponse, BatchCreatePayload>({
            query: (body) => ({
                url: '/domains/batches',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Batch', id: 'LIST' }],
        }),

        // PATCH /domains/batches/:id
        updateBatch: builder.mutation<BatchResponse, { id: string; body: BatchUpdatePayload }>({
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
