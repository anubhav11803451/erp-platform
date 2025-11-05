import { useMemo } from 'react';

import { toast } from 'sonner';
import { UserRole } from '@erp/common/enums';

import type { EnrichedBatch } from '@/features/batches/batches-api-slice';
import { useAddBatchMutation, useUpdateBatchMutation } from '@/features/batches/batches-api-slice';
import { useGetUsersQuery } from '@/features/users/users-api-slice';
import type { BatchFormValues } from '@/features/batches/form-schema';
import { getApiErrorMessage } from '@/lib/utils';

type UseBatchFormProps = {
    batchToEdit?: EnrichedBatch | null;
    setIsOpen: (open: boolean) => void;
};

// 2. Custom hook
export function useBatchForm({ batchToEdit, setIsOpen }: UseBatchFormProps) {
    const isEditMode = !!batchToEdit;

    // 3. API mutations and queries
    const [addBatch, { isLoading: isAdding }] = useAddBatchMutation();
    const [updateBatch, { isLoading: isUpdating }] = useUpdateBatchMutation();
    const { data: users, isLoading: isLoadingTutors } = useGetUsersQuery();

    const isLoading = isAdding || isUpdating;

    const initialValues: BatchFormValues = useMemo(() => {
        if (!isEditMode)
            return {
                name: '',
                subject: undefined,
                tutorId: undefined,
            };
        return {
            name: batchToEdit.name,
            subject: batchToEdit.subject || undefined,
            tutorId: batchToEdit.tutorId || undefined,
        };
    }, [isEditMode, batchToEdit]);

    // 6. Submit handler
    const onSubmit = async (data: BatchFormValues) => {
        const payload = {
            ...data,
            subject: data.subject || undefined,
            tutorId: data.tutorId || undefined,
        };

        try {
            if (isEditMode) {
                await updateBatch({
                    id: batchToEdit.id,
                    body: payload,
                }).unwrap();
                toast.success('Batch updated successfully!');
            } else {
                await addBatch(payload).unwrap();
                toast.success('Batch created successfully!');
            }
            setIsOpen(false);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };

    // 7. Data processing
    const tutors = users?.filter((user) => user.role === UserRole.STAFF) || [];

    // 8. Return values
    return {
        initialValues,
        onSubmit,
        isLoading,
        isEditMode,
        tutors,
        isLoadingTutors,
    };
}
