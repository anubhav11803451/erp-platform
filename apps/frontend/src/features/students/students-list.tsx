import React from 'react';
import { useGetStudentsQuery } from './student-api-slice';
// We'll need our types again!
import type { Student } from '@erp/db';

// A simple component to display the list of students
const StudentList: React.FC = () => {
    const { data: students, isLoading, isSuccess, isError, error } = useGetStudentsQuery();

    let content;

    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isSuccess) {
        content = (
            <ul className="list-disc pl-5">
                {students.map((student: Student) => (
                    <li key={student.id}>
                        {student.first_name} {student.last_name} ({student.email})
                    </li>
                ))}
            </ul>
        );
    } else if (isError) {
        content = <p>{JSON.stringify(error)}</p>;
    }

    return (
        <div className="p-4">
            <h2 className="mb-2 text-xl font-semibold">Student List</h2>
            {content}
        </div>
    );
};
export default StudentList;
