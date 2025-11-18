import { useMemo } from 'react';
import { toast } from 'sonner';

import {
    useAddPaymentMutation,
    useUpdatePaymentMutation,
} from '@/features/payments/payments-api-slice';
import { useGetEnrollmentsByStudentQuery } from '@/features/enrollment/enrollment-api-slice';
import { type PaymentCreatePayload, type EnrichedPayment, PaymentMethod } from '@erp/shared';
import { getApiErrorMessage } from '@/lib/utils';

type UsePaymentFormProps = {
    setIsOpen: (open: boolean) => void;
    studentId: string | null;
    batchId?: string | null;
    paymentToEdit?: EnrichedPayment | null;
};

export function usePaymentForm({
    setIsOpen,
    studentId,
    paymentToEdit,
    batchId,
}: UsePaymentFormProps) {
    const isEditMode = !!paymentToEdit;
    // --- Data Fetching ---
    const [addPayment, { isLoading: isAdding }] = useAddPaymentMutation();
    const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation();
    // Fetch the batches this student is enrolled in
    const { data: enrollments, isLoading: isLoadingEnrollments } = useGetEnrollmentsByStudentQuery(
        studentId!,
        {
            skip: !studentId,
        }
    );

    const isLoading = isAdding || isUpdating;

    // Memoize the dropdown options
    const batchOptions = useMemo(() => {
        const options =
            enrollments?.map((enrollment) => ({
                value: enrollment.batch.id,
                label: enrollment.batch.name.concat(` (${enrollment.batch.subject})`),
            })) || [];
        if (!isEditMode) {
            return batchId ? options?.filter((option) => option.value === batchId) : options;
        }

        return options?.filter((option) => option.value === paymentToEdit?.batchId);
    }, [enrollments, isEditMode, paymentToEdit, batchId]);

    const initialValues: PaymentCreatePayload = useMemo(() => {
        if (!isEditMode) {
            return {
                studentId: studentId || '',
                amount: 0,
                batchId: batchId || '',
                method: PaymentMethod.Cash,
                notes: batchId
                    ? 'Adding payment for batch id: ' +
                      batchId +
                      ' namely: ' +
                      batchOptions?.[0]?.label
                    : 'Adding payment for student: ' + studentId,
            };
        }
        return {
            studentId: paymentToEdit?.studentId || '',
            amount: paymentToEdit?.amount || 0,
            batchId: paymentToEdit?.batchId || '',
            method: paymentToEdit?.method || '',
            notes: paymentToEdit?.notes || '',
        };
    }, [isEditMode, paymentToEdit, batchId, studentId, batchOptions]);

    const onSubmit = async (data: PaymentCreatePayload) => {
        try {
            if (isEditMode) {
                await updatePayment({
                    id: paymentToEdit!.id,
                    body: data,
                }).unwrap();
                toast.success('Payment updated successfully!');
            } else {
                await addPayment({
                    ...data,
                    studentId: studentId!,
                }).unwrap();
                toast.success('Payment logged successfully!');
            }
            setIsOpen(false);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };

    return {
        isEditMode,
        initialValues,
        onSubmit,
        isLoading,
        batchOptions,
        isLoadingEnrollments,
    };
}
