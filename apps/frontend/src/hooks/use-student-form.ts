import { useMemo } from 'react';
import { toast } from 'sonner';

import type {
    CreateStudentInput,
    EnrichedStudent,
    UpdateStudentInput,
} from '@/features/students/student-api-slice';
import {
    useAddStudentMutation,
    useUpdateStudentMutation,
} from '@/features/students/student-api-slice';
import type { StudentFormValues } from '@/features/students/form-schema';

type UseStudentFormProps = {
    studentToEdit?: EnrichedStudent | null;
    setIsOpen: (open: boolean) => void;
};

// 2. Custom hook containing all form logic
export function useStudentForm({ studentToEdit, setIsOpen }: UseStudentFormProps) {
    const isEditMode = !!studentToEdit;

    const initialValues: StudentFormValues = useMemo(() => {
        if (!isEditMode)
            return {
                first_name: '',
                last_name: '',
                email: undefined,
                phone: undefined,
                school_name: undefined,
                guardian: {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: undefined,
                },
            };
        return {
            first_name: studentToEdit.first_name,
            last_name: studentToEdit.last_name,
            email: studentToEdit.email || undefined,
            phone: studentToEdit.phone || undefined,
            school_name: studentToEdit.school_name || undefined,
            guardian: {
                first_name: studentToEdit.guardian.first_name,
                last_name: studentToEdit.guardian.last_name,
                email: studentToEdit.guardian.email,
                phone: studentToEdit.guardian.phone || undefined,
            },
        };
    }, [isEditMode, studentToEdit]);

    // 3. API mutations
    const [addStudent, { isLoading: isAdding }] = useAddStudentMutation();
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
    const isLoading = isAdding || isUpdating;

    // 6. Submit handler
    const onSubmit = async (data: StudentFormValues) => {
        const payload = {
            ...data,
            email: data.email || undefined,
            phone: data.phone || undefined,
            school_name: data.school_name || undefined,
        };
        //
        try {
            if (isEditMode) {
                // Update logic
                const updateDto: UpdateStudentInput = {
                    ...data,
                    guardian: { ...data.guardian },
                };
                await updateStudent({
                    id: studentToEdit.id,
                    data: updateDto,
                }).unwrap();
                toast.success('Student updated successfully!');
            } else {
                // Create logic
                const createDto: CreateStudentInput = payload;
                await addStudent(createDto).unwrap();
                toast.success('Student created successfully!');
            }
            setIsOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || 'An error occurred.');
        }
    };

    // 7. Return everything the component needs
    return {
        initialValues,
        onSubmit,
        isLoading,
        isEditMode,
    };
}
