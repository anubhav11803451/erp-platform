import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { SmartForm } from '@/components/smart-form';
import { TextField, SelectField, PasswordField } from '@/components/smart-form/form-fields';

import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import { useUserForm } from '@/hooks/use-user-form';
import { userCreateSchema, UserRole, userUpdateSchema, type UserResponse } from '@erp/shared';
import { Field, FieldGroup } from '@/components/ui/field';
import { Grid } from '@/components/ui/grid';

type UserFormDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    userToEdit?: UserResponse | null;
};

export function UserFormDialog({ isOpen, setIsOpen, userToEdit }: UserFormDialogProps) {
    // Use the custom hook for all logic
    const { initialValues, onSubmit, isLoading, isEditMode } = useUserForm({
        setIsOpen,
        userToEdit,
    });

    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={isEditMode ? 'Edit Staff/Admin' : 'Add New Staff'}
            description={
                isEditMode ? 'Update the user details.' : 'Create a new staff or admin user.'
            }
            className="sm:max-w-lg"
        >
            <SmartForm
                id="user-form"
                defaultValues={initialValues}
                schema={isEditMode ? userUpdateSchema : userCreateSchema}
                enableReinitialize={true}
                resetAfterSubmit={false}
                showSubmitButton={false}
                onSubmit={onSubmit}
                className="space-y-6"
            >
                <FieldGroup>
                    <Grid columns={2} className="gap-4">
                        <TextField name="first_name" label="First Name" required />
                        <TextField name="last_name" label="Last Name" required />
                    </Grid>

                    <TextField name="email" label="Email Address" type="email" required />

                    <PasswordField
                        name="password"
                        label={isEditMode ? 'New Password (Optional)' : 'Password'}
                        description={
                            isEditMode ? 'Leave blank to keep the current password.' : undefined
                        }
                        required={!isEditMode}
                    />

                    <SelectField
                        name="role"
                        label="Role"
                        options={[
                            { value: UserRole.STAFF, label: 'Staff (Tutor)' },
                            { value: UserRole.ADMIN, label: 'Admin' },
                        ]}
                        required
                    />
                </FieldGroup>

                <DialogFooter>
                    <Field orientation="horizontal">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create User'}
                        </Button>
                    </Field>
                </DialogFooter>
            </SmartForm>
        </FormDialogShell>
    );
}
