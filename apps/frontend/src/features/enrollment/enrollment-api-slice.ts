import { apiSlice } from '@/api/api-slice';
import type {
    EnrolledStudent,
    EnrollmentCreatePayload,
    EnrollmentRemovePayload,
    StudentBatchResponse,
    BatchEnrollment,
} from '@erp/shared';

export const enrollmentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEnrollmentsByBatch: builder.query<EnrolledStudent[], string>({
            query: (batchId) => `/features/enrollment/batch/${batchId}`,
            providesTags: (result, _error, batchId) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'Enrollment' as const, id })),
                          { type: 'Enrollment', id: `LIST-${batchId}` },
                      ]
                    : [{ type: 'Enrollment', id: `LIST-${batchId}` }],
        }),

        getEnrollmentsByStudent: builder.query<BatchEnrollment[], string>({
            query: (studentId) => `/features/enrollment/student/${studentId}`,
            providesTags: (_result, _error, studentId) => [
                { type: 'Enrollment', id: `LIST-STUDENT-${studentId}` },
            ],
        }),

        addEnrollment: builder.mutation<StudentBatchResponse, EnrollmentCreatePayload>({
            query: (body) => ({
                url: '/features/enrollment',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result) => [{ type: 'Enrollment', id: `LIST-${result?.batchId}` }],
        }),
        deleteEnrollment: builder.mutation<{ count: number }, EnrollmentRemovePayload>({
            query: (body) => ({
                url: '/features/enrollment/disenroll',
                method: 'DELETE',
                body,
            }),
            invalidatesTags: (_result, _error, { batchId }) => [
                { type: 'Enrollment', id: `LIST-${batchId}` },
            ],
        }),
    }),
});

export const {
    useGetEnrollmentsByBatchQuery,
    useAddEnrollmentMutation,
    useDeleteEnrollmentMutation,
    useGetEnrollmentsByStudentQuery,
} = enrollmentApiSlice;
