import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { TextField, SelectField, TextareaField } from '@/components/smart-form/form-fields';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import { usePaymentForm } from '@/hooks/use-payment-from';

import { paymentMethodOptions } from '@/lib/constants';
import { Field, FieldGroup } from '@/components/ui/field';
import { SmartForm } from '@/components/smart-form';
import { paymentFormSchema } from './from-schema';
// import type { EnrichedPayment } from './payments-api-slice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { closePaymentFormModal, selectPaymentFormModal } from '@/app/ui-slice';

// type PaymentFormDialogProps = {
//     isOpen: boolean;
//     setIsOpen: (open: boolean) => void;
//     studentId: string;
//     paymentToEdit?: EnrichedPayment | null;
// };

export function PaymentFormDialog() {
    const dispatch = useAppDispatch();
    const { isOpen, studentId, paymentToEdit, batch } = useAppSelector(selectPaymentFormModal);
    const setIsOpen = () => dispatch(closePaymentFormModal());
    const { initialValues, onSubmit, isLoading, batchOptions, isLoadingEnrollments } =
        usePaymentForm({
            setIsOpen,
            studentId,
            paymentToEdit,
            batch,
        });

    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Add New Payment"
            description="Log a new payment received from this student."
            className="sm:max-w-lg"
        >
            <SmartForm
                id="add-payment-form"
                schema={paymentFormSchema}
                defaultValues={initialValues}
                showSubmitButton={false}
                onSubmit={onSubmit}
            >
                <FieldGroup>
                    <SelectField
                        name="batchId"
                        label="For Batch"
                        options={batchOptions}
                        placeholder="Select a batch..."
                        disabled={isLoadingEnrollments}
                        required
                    />
                    <TextField
                        name="amount"
                        label="Amount (₹)"
                        placeholder="e.g., 5000"
                        type="number"
                        required
                    />

                    <SelectField
                        name="method"
                        label="Payment Method"
                        options={paymentMethodOptions}
                        placeholder="Select a method..."
                        required
                    />

                    <TextareaField
                        name="notes"
                        label="Notes (Optional)"
                        placeholder="e.g., Part of first installment"
                    />
                </FieldGroup>
                <DialogFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={() => setIsOpen()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Log Payment'}
                        </Button>
                    </Field>
                </DialogFooter>
            </SmartForm>
        </FormDialogShell>
    );
}
