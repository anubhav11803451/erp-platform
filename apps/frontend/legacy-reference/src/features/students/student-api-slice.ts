import { apiSlice } from '@/api/api-slice';
import type {
    EnrichedStudent,
    StudentCreatePayload,
    StudentResponse,
    StudentUpdatePayload,
} from '@erp/shared';

// Injects endpoints into the root apiSlice
export const studentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query: GET /domains/students
        getStudents: builder.query<EnrichedStudent[], void>({
            query: () => '/domains/students',
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'Student' as const, id })),
                          { type: 'Student', id: 'LIST' },
                      ]
                    : [{ type: 'Student', id: 'LIST' }],
        }),
        // Mutation: POST /domains/students
        addStudent: builder.mutation<StudentResponse, StudentCreatePayload>({
            query: (newStudent) => ({
                url: '/domains/students',
                method: 'POST',
                body: newStudent,
            }),
            invalidatesTags: [{ type: 'Student', id: 'LIST' }],
        }),
        // Query: GET /domains/students/:id
        getStudent: builder.query<EnrichedStudent, string>({
            query: (id) => `/domains/students/${id}`,
            // Provides a specific tag for this student: { type: 'Student', id: '123' }
            providesTags: (_result, _error, id) => [{ type: 'Student', id }],
        }),

        // Mutation: PATCH /domains/students/:id
        updateStudent: builder.mutation<
            StudentResponse,
            { id: string; data: StudentUpdatePayload }
        >({
            query: ({ id, data }) => ({
                url: `/domains/students/${id}`,
                method: 'PATCH',
                body: data,
            }),
            // Invalidates both the list and the specific student's tag.
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Student', id },
                { type: 'Student', id: 'LIST' },
            ],
        }),

        // Mutation: DELETE /domains/students/:id
        deleteStudent: builder.mutation<StudentResponse, string>({
            query: (id) => ({
                url: `/domains/students/${id}`,
                method: 'DELETE',
            }),
            // Invalidates both the list and the specific student's tag.
            invalidatesTags: (_result, _error, id) => [
                { type: 'Student', id },
                { type: 'Student', id: 'LIST' },
            ],
        }),
    }),
});

// Export auto-generated hooks for use in components
export const {
    useGetStudentsQuery,
    useGetStudentQuery,
    useAddStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApiSlice;
