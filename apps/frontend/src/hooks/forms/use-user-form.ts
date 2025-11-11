import { useMemo } from 'react';

import { toast } from 'sonner';

import { useAddUserMutation, useUpdateUserMutation } from '@/features/users/users-api-slice';
import {
    UserRole,
    type UserCreatePayload,
    type UserResponse,
    type UserUpdatePayload,
} from '@erp/shared';
import { getApiErrorMessage } from '@/lib/utils';

type UseUserFormProps = {
    setIsOpen: (open: boolean) => void;
    userToEdit?: UserResponse | null;
};

export function useUserForm({ setIsOpen, userToEdit }: UseUserFormProps) {
    const isEditMode = !!userToEdit;

    // --- Data Fetching ---
    const [addUser, { isLoading: isAdding }] = useAddUserMutation();
    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const isLoading = isAdding || isUpdating;

    // If we are in "edit" mode, pre-populate the form
    const initialValues: UserUpdatePayload = useMemo(() => {
        if (isEditMode) {
            return {
                first_name: userToEdit.first_name,
                last_name: userToEdit.last_name,
                email: userToEdit.email,
                role: userToEdit.role,
                password: '', // Don't pre-fill password
            };
        } else {
            return {
                first_name: '',
                last_name: '',
                email: '',
                role: UserRole.STAFF, // Default to STAFF
                password: '',
            };
        }
    }, [userToEdit, isEditMode]); // isOpen ensures reset on re-open

    const onSubmit = async (data: UserCreatePayload | UserUpdatePayload) => {
        // Only send password if it's not edit mode OR if it's been filled in
        const payload = {
            ...data,
            password: !isEditMode || data.password ? data.password : undefined,
        };

        try {
            if (isEditMode) {
                await updateUser({
                    id: userToEdit.id,
                    body: payload as UserUpdatePayload,
                }).unwrap();
                toast.success('User updated successfully!');
            } else {
                await addUser({
                    ...payload,
                    password: data.password!,
                } as UserCreatePayload).unwrap();
                toast.success('User created successfully!');
            }
            setIsOpen(false);
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };

    return { initialValues, isLoading, onSubmit, isEditMode };
}
