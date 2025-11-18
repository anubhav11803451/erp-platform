import { useMemo } from 'react';
import { toast } from 'sonner';

import { useAddEnrollmentMutation } from '@/features/enrollment/enrollment-api-slice';
import { useGetStudentsQuery } from '@/features/students/student-api-slice';
import { getApiErrorMessage } from '@/lib/utils';
import type { EnrolledStudent, EnrollmentCreatePayload } from '@erp/shared';

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

    const initialValues: EnrollmentCreatePayload = useMemo(() => {
        return {
            batchId: batchId,
            studentId: '',
            total_fee_agreed: 0,
        };
    }, []);

    const onSubmit = async (data: EnrollmentCreatePayload) => {
        try {
            await addEnrollment({
                ...data,
            }).unwrap();
            toast.success('Student enrolled successfully!');
            setIsOpen(false);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
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
