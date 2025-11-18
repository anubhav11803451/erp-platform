'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from '@/features/users/table/columns';
import { DataTableToolbar } from '@/features/users/table/toolbar';
import { UserFormDialog } from '@/features/users/user-from';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useGetUsersQuery, useDeleteUserMutation } from '@/features/users/users-api-slice';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import type { UserResponse } from '@erp/shared';

export default function UsersPage() {
    // --- Data Fetching ---
    const { data: users, isLoading, isError, error } = useGetUsersQuery();
    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
    const currentUser = useAppSelector(selectCurrentUser);

    // --- State for Modals ---
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [userToEdit, setUserToEdit] = React.useState<UserResponse | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<string | null>(null);

    // --- Action Handlers ---
    const handleAddUser = () => {
        setUserToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditUser = (user: UserResponse) => {
        setUserToEdit(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        if (userId === currentUser?.id) {
            toast.error('You cannot delete your own account.');
            return;
        }
        setUserToDelete(userId);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await deleteUser(userToDelete).unwrap();
            toast.success('User deleted successfully.');
            setIsDeleteAlertOpen(false);
            setUserToDelete(null);
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to delete user.');
        }
    };

    // --- Define Columns ---
    const columns = React.useMemo(
        () =>
            getColumns({
                onEdit: handleEditUser,
                onDelete: handleDeleteUser,
            }),
        [currentUser?.id] // Re-memoize if current user changes
    );

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="text-primary h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="border-destructive/20 bg-destructive/10 flex h-[400px] items-center justify-center rounded-md border p-4">
                <p className="text-destructive-foreground">
                    Failed to load users: {JSON.stringify(error)}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-4 text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground mb-8">
                Add, edit, and manage staff (Tutors) and admin accounts.
            </p>

            {/* The Data Table */}
            <DataTable
                columns={columns}
                data={users || []}
                toolbar={(table) => (
                    <DataTableToolbar table={table} onAddUserClick={handleAddUser} />
                )}
            />

            {/* Add/Edit User Dialog */}
            <UserFormDialog isOpen={isFormOpen} setIsOpen={setIsFormOpen} userToEdit={userToEdit} />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={confirmDelete}
                title="Delete User"
                description="This action cannot be undone. This will permanently delete the user's account."
                isLoading={isDeleting}
            />
        </div>
    );
}
