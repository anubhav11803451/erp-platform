import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import { type EnrichedStudent, studentCreateSchema } from '@erp/shared';
import { useStudentForm } from '@/hooks/forms/use-student-form';

import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';

import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from '@/components/ui/field';
import { Grid } from '@/components/ui/grid';

type StudentFormDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    studentToEdit?: EnrichedStudent | null;
};

export function StudentFormDialog({ isOpen, setIsOpen, studentToEdit }: StudentFormDialogProps) {
    const { initialValues, onSubmit, isLoading, isEditMode } = useStudentForm({
        studentToEdit,
        setIsOpen,
    });

    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={isEditMode ? 'Edit Student' : 'Add New Student'}
            description={
                isEditMode
                    ? "Update the student's details."
                    : 'Fill in the details for the new student and their guardian.'
            }
        >
            <SmartForm
                id="student-form"
                schema={studentCreateSchema}
                defaultValues={initialValues}
                enableReinitialize={true}
                resetAfterSubmit={false}
                showSubmitButton={false}
                onSubmit={onSubmit}
            >
                <FieldGroup>
                    <FieldSet className="space-y-4 rounded-md border p-4">
                        <FieldLegend className="text-lg font-medium">Student Details</FieldLegend>

                        <FieldGroup>
                            <Grid columns={1} className="gap-4 md:grid-cols-2">
                                <TextField
                                    name="first_name"
                                    label="First Name"
                                    placeholder="Jane"
                                />
                                <TextField name="last_name" label="Last Name" placeholder="Doe" />
                                <TextField
                                    name="email"
                                    label="Student Email (Optional)"
                                    placeholder="jane.doe@example.com"
                                />
                                <TextField
                                    name="phone"
                                    label="Student Phone (Optional)"
                                    placeholder="+1 234 567 890"
                                />
                            </Grid>
                            <TextField
                                name="school_name"
                                label="School Name (Optional)"
                                placeholder="Springfield High"
                            />
                        </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <FieldSet className="space-y-4 rounded-md border p-4">
                        <FieldLegend className="text-lg font-medium">Guardian Details</FieldLegend>
                        <FieldDescription className="text-muted-foreground text-sm">
                            The system will automatically find an existing guardian by email or
                            create a new one.
                        </FieldDescription>
                        <FieldGroup>
                            <Grid columns={1} className="gap-4 md:grid-cols-2">
                                <TextField
                                    name="guardian.first_name"
                                    label="Guardian First Name"
                                    placeholder="John"
                                />
                                <TextField
                                    name="guardian.last_name"
                                    label="Guardian Last Name"
                                    placeholder="Doe"
                                />
                                <TextField
                                    name="guardian.email"
                                    label="Guardian Email"
                                    placeholder="john.doe@example.com"
                                />
                                <TextField
                                    name="guardian.phone"
                                    label="Guardian Phone (Optional)"
                                    placeholder="+1 987 654 321"
                                />
                            </Grid>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
                <DialogFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form="student-form" disabled={isLoading}>
                            {isLoading
                                ? 'Saving...'
                                : isEditMode
                                  ? 'Save Changes'
                                  : 'Create Student'}
                        </Button>
                    </Field>
                </DialogFooter>
            </SmartForm>
        </FormDialogShell>
    );
}
