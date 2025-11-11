'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from '@/features/students/table/columns';
import { DataTableToolbar } from '@/features/students/table/table-toolbar';
import { StudentFormDialog } from '@/features/students/student-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
    useGetStudentsQuery,
    useDeleteStudentMutation,
} from '@/features/students/student-api-slice';
import type { EnrichedStudent } from '@erp/shared';

export default function StudentsPage() {
    // --- Data Fetching ---
    const { data: students, isLoading, isError, error } = useGetStudentsQuery();
    const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

    // --- State for Modals ---
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [studentToEdit, setStudentToEdit] = React.useState<EnrichedStudent | null>(null);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [studentToDelete, setStudentToDelete] = React.useState<string | null>(null);

    // --- Action Handlers ---
    const handleAddStudent = () => {
        setStudentToEdit(null);
        setIsFormOpen(true);
    };

    const handleEditStudent = (student: EnrichedStudent) => {
        setStudentToEdit(student);
        setIsFormOpen(true);
    };

    const handleDeleteStudent = (studentId: string) => {
        setStudentToDelete(studentId);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;
        try {
            await deleteStudent(studentToDelete).unwrap();
            toast.success('Student deleted successfully.');
            setIsDeleteAlertOpen(false);
            setStudentToDelete(null);
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to delete student.');
        }
    };

    // --- Define Columns ---
    const columns = React.useMemo(
        () =>
            getColumns({
                onEdit: handleEditStudent,
                onDelete: handleDeleteStudent,
            }),
        []
    );

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader className="text-primary h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="border-destructive/20 bg-destructive/10 flex h-[400px] items-center justify-center rounded-md border p-4">
                <p className="text-destructive-foreground">
                    Failed to load students: {JSON.stringify(error)}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-4 text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground mb-8">
                View, add, edit, and manage all students in your institution.
            </p>

            {/* The Data Table */}
            <DataTable
                columns={columns || []}
                data={students || []}
                toolbar={(table) => (
                    <DataTableToolbar table={table} onAddStudentClick={handleAddStudent} />
                )}
            />

            {/* Add/Edit Student Dialog */}
            <StudentFormDialog
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                studentToEdit={studentToEdit}
            />

            {/* --- REFACTORED DELETE DIALOG --- */}
            <ConfirmDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                description="This action cannot be undone. This will permanently delete the
              student and all their related data (payments, attendance)."
            />
        </div>
    );
}
