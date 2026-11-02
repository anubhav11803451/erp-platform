import { apiSlice } from '@/api/api-slice';
import type {
    EnrichedPayment,
    PaymentCreatePayload,
    PaymentResponse,
    PaymentUpdatePayload,
} from '@erp/shared';

export const paymentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaymentsByStudent: builder.query<EnrichedPayment[], string>({
            query: (studentId) => `/features/payments/student/${studentId}`,
            providesTags: (_result, _error, studentId) => [
                { type: 'Payment', id: `LIST-STUDENT-${studentId}` },
            ],
        }),
        addPayment: builder.mutation<PaymentResponse, PaymentCreatePayload>({
            query: (body) => ({
                url: '/features/payments',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result) => [
                { type: 'Payment', id: `LIST-STUDENT-${result?.studentId}` },
            ],
        }),
        updatePayment: builder.mutation<
            PaymentResponse,
            { id: string; body: PaymentUpdatePayload }
        >({
            query: ({ id, body }) => ({
                url: `/features/payments/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result) => [
                { type: 'Payment', id: result?.id },
                { type: 'Payment', id: `LIST-STUDENT-${result?.studentId}` },
            ],
        }),
        deletePayment: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `/features/payments/${id}`,
                method: 'DELETE',
            }),
            // We need to invalidate the student's list, but we don't know the ID
            // A better way is to invalidate the whole list
            invalidatesTags: (_result, _error, id) => [{ type: 'Payment', id }],
        }),
    }),
});

export const {
    useGetPaymentsByStudentQuery,
    useAddPaymentMutation,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,
} = paymentsApiSlice;
