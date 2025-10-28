import { apiSlice } from '@/api/api-slice';
// THIS IS THE MAGIC! We import our Prisma types directly into the frontend.
import type { Student } from '@erp/db';

// Define the shape of the data for creating a student.
// It's our 'Student' type, minus the fields the DB generates.
export type CreateStudentInput = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
// Define the shape for updating. It's a partial of the create input.
type UpdateStudentInput = Partial<CreateStudentInput>;

// Injects endpoints into the root apiSlice
export const studentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query: GET /domains/students
        getStudents: builder.query<Student[], void>({
            query: () => '/domains/students',
            // Provides a 'Student' tag for the whole list.
            // RTK Query will re-fetch this if the 'Student' tag is invalidated.
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'Student' as const, id })),
                          { type: 'Student', id: 'LIST' },
                      ]
                    : [{ type: 'Student', id: 'LIST' }],
        }),

        // Query: GET /domains/students/:id
        getStudentById: builder.query<Student, string>({
            query: (id) => `/domains/students/${id}`,
            // Provides a specific tag for this student: { type: 'Student', id: '123' }
            providesTags: (result, error, id) => [{ type: 'Student', id }],
        }),

        // Mutation: POST /domains/students
        createStudent: builder.mutation<Student, CreateStudentInput>({
            query: (body) => ({
                url: '/domains/students',
                method: 'POST',
                body,
            }),
            // Invalidates the 'Student' list tag, forcing a re-fetch of getStudents.
            invalidatesTags: [{ type: 'Student', id: 'LIST' }],
        }),

        // Mutation: PATCH /domains/students/:id
        updateStudent: builder.mutation<Student, { id: string; data: UpdateStudentInput }>({
            query: ({ id, data }) => ({
                url: `/domains/students/${id}`,
                method: 'PATCH',
                body: data,
            }),
            // Invalidates both the list and the specific student's tag.
            invalidatesTags: (result, error, { id }) => [
                { type: 'Student', id },
                { type: 'Student', id: 'LIST' },
            ],
        }),

        // Mutation: DELETE /domains/students/:id
        deleteStudent: builder.mutation<Student, string>({
            query: (id) => ({
                url: `/domains/students/${id}`,
                method: 'DELETE',
            }),
            // Invalidates both the list and the specific student's tag.
            invalidatesTags: (result, error, id) => [
                { type: 'Student', id },
                { type: 'Student', id: 'LIST' },
            ],
        }),
    }),
});

// Export auto-generated hooks for use in components
export const {
    useGetStudentsQuery,
    useGetStudentByIdQuery,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApiSlice;
