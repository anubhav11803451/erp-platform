import React, { useState } from 'react';
import { useGetStudentsQuery, useAddStudentMutation } from './student-api-slice';

function Students() {
    const { data: students, isLoading, isSuccess, isError, error } = useGetStudentsQuery();
    const [addStudent, { isLoading: isAdding }] = useAddStudentMutation();

    // --- NEW: State for our more complex form ---
    const [studentFirstName, setStudentFirstName] = useState('');
    const [studentLastName, setStudentLastName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [studentSchool, setStudentSchool] = useState('');

    const [guardianFirstName, setGuardianFirstName] = useState('');
    const [guardianLastName, setGuardianLastName] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdding) return;

        // --- NEW: Construct the nested payload ---
        const payload = {
            first_name: studentFirstName,
            last_name: studentLastName,
            email: studentEmail || undefined,
            school_name: studentSchool || undefined,
            guardian: {
                first_name: guardianFirstName,
                last_name: guardianLastName,
                email: guardianEmail,
                phone: guardianPhone || undefined,
            },
        };

        try {
            await addStudent(payload).unwrap();
            // Clear form on success
            setStudentFirstName('');
            setStudentLastName('');
            setStudentEmail('');
            setStudentSchool('');
            setGuardianFirstName('');
            setGuardianLastName('');
            setGuardianEmail('');
            setGuardianPhone('');
        } catch (err) {
            console.error('Failed to add student:', err);
        }
    };

    let content;
    if (isLoading) {
        content = <div>Loading...</div>;
    } else if (isSuccess) {
        content = (
            <ul>
                {/* --- UPDATED: Display guardian info --- */}
                {students.map((student) => (
                    <li key={student.id}>
                        {student?.first_name} {student?.last_name} (
                        {student.school_name || 'No school'})
                        <br />
                        <small>
                            Guardian: {student.guardian.first_name} {student.guardian.last_name} (
                            {student.guardian.email})
                        </small>
                    </li>
                ))}
            </ul>
        );
    } else if (isError) {
        content = <div>{error.toString()}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Student Management</h1>
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <h2>Add New Student</h2>
                    {/* --- NEW: Updated form --- */}
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            maxWidth: '400px',
                        }}
                    >
                        <fieldset
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                border: '1px solid #ccc',
                                padding: '10px',
                            }}
                        >
                            <legend>Student Info</legend>
                            <input
                                type="text"
                                placeholder="Student First Name"
                                value={studentFirstName}
                                onChange={(e) => setStudentFirstName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Student Last Name"
                                value={studentLastName}
                                onChange={(e) => setStudentLastName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Student Email (Optional)"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="School Name (Optional)"
                                value={studentSchool}
                                onChange={(e) => setStudentSchool(e.target.value)}
                            />
                        </fieldset>

                        <fieldset
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                border: '1px solid #ccc',
                                padding: '10px',
                            }}
                        >
                            <legend>Guardian Info</legend>
                            <input
                                type="text"
                                placeholder="Guardian First Name"
                                value={guardianFirstName}
                                onChange={(e) => setGuardianFirstName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Guardian Last Name"
                                value={guardianLastName}
                                onChange={(e) => setGuardianLastName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Guardian Email"
                                value={guardianEmail}
                                onChange={(e) => setGuardianEmail(e.target.value)}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Guardian Phone (Optional)"
                                value={guardianPhone}
                                onChange={(e) => setGuardianPhone(e.target.value)}
                            />
                        </fieldset>

                        <button type="submit" disabled={isAdding}>
                            {isAdding ? 'Adding...' : 'Add Student'}
                        </button>
                    </form>
                </div>
                <div style={{ flex: 1 }}>
                    <h2>Current Students</h2>
                    {content}
                </div>
            </div>
        </div>
    );
}

export default Students;
