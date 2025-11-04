import { apiSlice } from '@/api/api-slice';
import type { StudentBatch, Student, Guardian } from '@erp/common/types';

// Define the shape of the enrollment DTO
export type CreateEnrollmentInput = {
    studentId: string;
    batchId: string;
    total_fee_agreed: number;
};

export type DisenrollPayload = {
    batchId: string;
    studentIds: string[];
};

// Define the rich type we get back from the 'getEnrollmentsByBatch' endpoint
export type EnrolledStudent = StudentBatch & {
    student: Student & {
        guardian: Guardian;
    };
};

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
        addEnrollment: builder.mutation<StudentBatch, CreateEnrollmentInput>({
            query: (body) => ({
                url: '/features/enrollment',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result) => [{ type: 'Enrollment', id: `LIST-${result?.batchId}` }],
        }),
        deleteEnrollment: builder.mutation<{ count: number }, DisenrollPayload>({
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
} = enrollmentApiSlice;
