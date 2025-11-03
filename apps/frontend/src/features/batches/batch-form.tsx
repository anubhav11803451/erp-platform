import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import type { EnrichedBatch } from '@/features/batches/batches-api-slice';
import { useBatchForm } from '@/hooks/use-batch-form';

// --- NEW IMPORTS ---
import { SmartForm } from '@/components/smart-form';
import { TextField, SelectField } from '@/components/smart-form/form-fields';
import { Field, FieldGroup } from '@/components/ui/field';
import { batchFormSchema } from './form-schema';
// --- END NEW IMPORTS ---

type BatchFormDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    batchToEdit?: EnrichedBatch | null;
};

export function BatchFormDialog({ isOpen, setIsOpen, batchToEdit }: BatchFormDialogProps) {
    const { initialValues, onSubmit, isLoading, isEditMode, tutors, isLoadingTutors } =
        useBatchForm({
            batchToEdit,
            setIsOpen,
        });

    // Convert tutors to the format SelectField expects
    const tutorOptions = tutors.map((tutor) => ({
        value: tutor.id,
        label: `${tutor.first_name} ${tutor.last_name}`,
    }));
    // Add an "Unassigned" option
    // tutorOptions.unshift({ value: '', label: 'Unassigned' });

    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={isEditMode ? 'Edit Batch' : 'Add New Batch'}
            description={
                isEditMode
                    ? "Update the batch's details."
                    : 'Fill in the details for the new batch.'
            }
            className="sm:max-w-lg"
        >
            {/* --- REFACTORED TO USE SmartForm --- */}
            <SmartForm
                id="batch-form"
                schema={batchFormSchema}
                defaultValues={initialValues}
                onSubmit={onSubmit}
                enableReinitialize={true}
                resetAfterSubmit={false}
                showSubmitButton={false}
                className="space-y-6"
            >
                <FieldGroup>
                    <TextField name="name" label="Batch Name" placeholder="Class 10 CBSE Maths" />

                    <TextField name="subject" label="Subject (Optional)" placeholder="Maths" />

                    <SelectField
                        name="tutorId"
                        label="Tutor (Optional)"
                        placeholder="Select a tutor..."
                        options={tutorOptions}
                        disabled={isLoadingTutors}
                    />

                    <DialogFooter>
                        <Field orientation="horizontal">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" form="batch-form" disabled={isLoading}>
                                {isLoading
                                    ? 'Saving...'
                                    : isEditMode
                                      ? 'Save Changes'
                                      : 'Create Batch'}
                            </Button>
                        </Field>
                    </DialogFooter>
                </FieldGroup>
            </SmartForm>
        </FormDialogShell>
    );
}
