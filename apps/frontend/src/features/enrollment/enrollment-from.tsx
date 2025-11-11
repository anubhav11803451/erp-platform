import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { SmartForm } from '@/components/smart-form';
import { TextField, SelectField } from '@/components/smart-form/form-fields';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';

import { type EnrolledStudent, enrollStudentSchema } from '@erp/shared';

import { Field, FieldGroup } from '@/components/ui/field';
import { useEnrollmentForm } from '@/hooks/forms/use-enrollment-form';

type EnrollStudentFormDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    batchId: string;
    alreadyEnrolled: EnrolledStudent[];
};

export function EnrollStudentFormDialog({
    isOpen,
    setIsOpen,
    batchId,
    alreadyEnrolled,
}: EnrollStudentFormDialogProps) {
    const { initialValues, isEnrolling, isLoadingStudents, availableStudents, onSubmit } =
        useEnrollmentForm({ batchId, alreadyEnrolled, setIsOpen });
    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Enroll New Student"
            description="Select a student to add to this batch and set their fee."
            className="sm:max-w-lg"
        >
            <SmartForm
                id="enroll-student-form"
                defaultValues={initialValues}
                schema={enrollStudentSchema}
                showSubmitButton={false}
                onSubmit={onSubmit}
            >
                <FieldGroup>
                    <SelectField
                        name="studentId"
                        label="Student"
                        placeholder="Select a student..."
                        options={availableStudents}
                        disabled={isLoadingStudents}
                        required
                    />

                    {/* Use a custom Input for number type */}
                    <TextField
                        name="total_fee_agreed"
                        label="Fee"
                        type="number"
                        placeholder="0.00"
                        disabled={isLoadingStudents}
                        required
                    />
                </FieldGroup>

                <DialogFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isEnrolling}>
                            {isEnrolling ? 'Enrolling...' : 'Enroll Student'}
                        </Button>
                    </Field>
                </DialogFooter>
            </SmartForm>
        </FormDialogShell>
    );
}
