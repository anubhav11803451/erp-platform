import { useMemo } from 'react';
import { toast } from 'sonner';

import {
    useAddPaymentMutation,
    useUpdatePaymentMutation,
    type EnrichedPayment,
} from '@/features/payments/payments-api-slice';
import { useGetEnrollmentsByStudentQuery } from '@/features/enrollment/enrollment-api-slice';
import type { PaymentFormValues } from '@/features/payments/from-schema';
import { getApiErrorMessage } from '@/lib/utils';

type UsePaymentFormProps = {
    setIsOpen: (open: boolean) => void;
    studentId: string | null;
    batch?: { name?: string; value: string } | null;
    paymentToEdit?: EnrichedPayment | null;
};

export function usePaymentForm({
    setIsOpen,
    studentId,
    paymentToEdit,
    batch,
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
        if (!isEditMode) {
            return (
                enrollments?.map((enrollment) => ({
                    value: enrollment.batch.id,
                    label: enrollment.batch.name.concat(` (${enrollment.batch.subject})`),
                })) || []
            );
        }
        if (batch) {
            return [
                {
                    value: batch.value,
                    label: batch.name || '',
                },
            ];
        }
        return [
            {
                value: paymentToEdit?.batchId || '',
                label: paymentToEdit?.batch.name || '',
            },
        ];
    }, [enrollments, isEditMode, paymentToEdit, batch]);

    const initialValues: PaymentFormValues = useMemo(() => {
        if (!isEditMode) {
            return {
                amount: 0,
                batchId: '',
                method: '',
                notes: '',
            };
        }
        return {
            amount: paymentToEdit?.amount || 0,
            batchId: paymentToEdit?.batchId || '',
            method: paymentToEdit?.method || '',
            notes: paymentToEdit?.notes || '',
        };
    }, [isEditMode, paymentToEdit]);

    const onSubmit = async (data: PaymentFormValues) => {
        try {
            if (isEditMode) {
                await updatePayment({
                    id: '',
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
        initialValues,
        onSubmit,
        isLoading,
        batchOptions,
        isLoadingEnrollments,
    };
}
