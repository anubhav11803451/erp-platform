import { useMemo } from 'react';
import { toast } from 'sonner';

import {
    useAddEnrollmentMutation,
    type EnrolledStudent,
} from '@/features/enrollment/enrollment-api-slice';
import { useGetStudentsQuery } from '@/features/students/student-api-slice';
import type { EnrollStudentFormValues } from '@/features/enrollment/form-schema';

type UseEnrollmentFormProps = {
    batchId: string;
    alreadyEnrolled: EnrolledStudent[];
    setIsOpen: (isOpen: boolean) => void;
};
export function useEnrollmentForm({ batchId, alreadyEnrolled, setIsOpen }: UseEnrollmentFormProps) {
    // --- Data Fetching ---
    const [addEnrollment, { isLoading: isEnrolling }] = useAddEnrollmentMutation();

    // Fetch ALL students to populate the dropdown
    const { data: allStudents, isLoading: isLoadingStudents } = useGetStudentsQuery();

    // Filter out students who are already in this batch
    const availableStudents = useMemo(() => {
        const enrolledIds = new Set(alreadyEnrolled.map((e) => e.studentId));
        return (
            allStudents
                ?.filter((s) => !enrolledIds.has(s.id))
                .map((s) => ({
                    value: s.id,
                    label: `${s.first_name} ${s.last_name} (Guardian: ${s.guardian.first_name})`,
                })) || []
        );
    }, [allStudents, alreadyEnrolled]);

    const initialValues: EnrollStudentFormValues = useMemo(() => {
        return {
            studentId: '',
            total_fee_agreed: 0,
        };
    }, []);

    const onSubmit = async (data: EnrollStudentFormValues) => {
        try {
            await addEnrollment({
                ...data,
                batchId: batchId,
            }).unwrap();
            toast.success('Student enrolled successfully!');
            setIsOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message?.join(', ') || err.data?.message || 'An error occurred.');
        }
    };

    return {
        initialValues,
        isEnrolling,
        availableStudents,
        isLoadingStudents,
        onSubmit,
    };
}
