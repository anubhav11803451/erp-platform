import { apiSlice } from '@/api/api-slice';
import type { Guardian, Student } from '@erp/db/browser';
// THIS IS THE MAGIC! We import our Prisma types directly into the frontend.
// --- NEW: Define the type for the data we get back from the 'findAll' endpoint ---
// Prisma's `include` returns a combined type.
type StudentWithGuardian = Student & {
    guardian: Guardian;
};

// --- NEW: Define the type for creating a student ---
// This must match the backend's CreateStudentDto
type CreateStudentPayload = {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    school_name?: string;
    guardian: {
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
    };
};
// Define the shape for updating. It's a partial of the create input.
type UpdateStudentInput = Partial<CreateStudentPayload>;

// Injects endpoints into the root apiSlice
export const studentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query: GET /domains/students
        getStudents: builder.query<StudentWithGuardian[], void>({
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
        addStudent: builder.mutation<Student, CreateStudentPayload>({
            query: (newStudent) => ({
                url: '/domains/students',
                method: 'POST',
                body: newStudent,
            }),
            invalidatesTags: [{ type: 'Student', id: 'LIST' }],
        }),
        // Query: GET /domains/students/:id
        getStudentById: builder.query<Student, string>({
            query: (id) => `/domains/students/${id}`,
            // Provides a specific tag for this student: { type: 'Student', id: '123' }
            providesTags: (_result, _error, id) => [{ type: 'Student', id }],
        }),

        // Mutation: PATCH /domains/students/:id
        updateStudent: builder.mutation<Student, { id: string; data: UpdateStudentInput }>({
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
        deleteStudent: builder.mutation<Student, string>({
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
    useGetStudentByIdQuery,
    useAddStudentMutation,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentsApiSlice;
