'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from '@/features/batches/table/columns';
import { DataTableToolbar } from '@/features/batches/table/toolbar';
import { BatchFormDialog } from '@/features/batches/batch-form';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
    useGetBatchesQuery,
    useDeleteBatchMutation,
    type EnrichedBatch,
} from '@/features/batches/batches-api-slice';

export default function BatchesPage() {
    // --- Data Fetching ---
    const { data: batches, isLoading, isError, error } = useGetBatchesQuery();
    const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

    // --- State for Modals ---
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [batchToEdit, setBatchToEdit] = React.useState<EnrichedBatch | null>(null);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [batchToDelete, setBatchToDelete] = React.useState<string | null>(null);

    // --- Action Handlers ---
    const handleAddBatch = () => {
        setBatchToEdit(null); // Clear any edit state
        setIsFormOpen(true);
    };

    const handleEditBatch = (batch: EnrichedBatch) => {
        setBatchToEdit(batch);
        setIsFormOpen(true);
    };

    const handleDeleteBatch = (batchId: string) => {
        setBatchToDelete(batchId);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!batchToDelete) return;
        try {
            await deleteBatch(batchToDelete).unwrap();
            toast.success('Batch deleted successfully.');
            setIsDeleteAlertOpen(false);
            setBatchToDelete(null);
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to delete batch.');
        }
    };

    // --- Define Columns ---
    const columns = React.useMemo(
        () =>
            getColumns({
                onEdit: handleEditBatch,
                onDelete: handleDeleteBatch,
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
                    Failed to load batches: {JSON.stringify(error)}
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-4 text-3xl font-bold">Batch Management</h1>
            <p className="text-muted-foreground mb-8">
                Create, update, and assign tutors to all your batches.
            </p>

            {/* The Data Table */}
            <DataTable
                hideColumns={['id']}
                columns={columns}
                data={batches || []}
                toolbar={(table) => (
                    <DataTableToolbar table={table} onAddBatchClick={handleAddBatch} />
                )}
            />

            {/* Add/Edit Batch Dialog */}
            <BatchFormDialog
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                batchToEdit={batchToEdit}
            />

            <ConfirmDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                description="This action cannot be undone. This will permanently delete the batch."
            />
        </div>
    );
}
