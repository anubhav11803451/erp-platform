import AddStudentForm from '@/features/students/add-student-form';
import StudentList from '@/features/students/students-list';

export default function StudentsPage() {
    return (
        <div className="space-y-8">
            <AddStudentForm />
            <StudentList />
        </div>
    );
}
