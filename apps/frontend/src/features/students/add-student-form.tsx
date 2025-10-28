import React from 'react';
import { useCreateStudentMutation, type CreateStudentInput } from './student-api-slice';

// We'll need our types again!

// A simple form to add a new student
const AddStudentForm: React.FC = () => {
    const [createStudent, { isLoading }] = useCreateStudentMutation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newStudent: CreateStudentInput = {
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            school_name: formData.get('school_name') as string,
            dob: null,
            guardian_name: null,
            guardian_phone: null,
        };

        try {
            await createStudent(newStudent).unwrap();
            e.currentTarget.reset();
        } catch (err) {
            console.error('Failed to save the student: ', err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-md border p-4 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Add New Student</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="rounded-md border p-2"
                />
                <input
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="rounded-md border p-2"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="rounded-md border p-2"
                />
                <input name="phone" placeholder="Phone" className="rounded-md border p-2" />
                <input
                    name="school_name"
                    placeholder="School Name"
                    className="rounded-md border p-2"
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="mt-4 rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
                {isLoading ? 'Saving...' : 'Add Student'}
            </button>
        </form>
    );
};

export default AddStudentForm;
