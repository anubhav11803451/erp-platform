/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBatchQuery } from '@/features/batches/batches-api-slice';
import {
    useDeleteEnrollmentMutation,
    useGetEnrollmentsByBatchQuery,
} from '@/features/enrollment/enrollment-api-slice';
import { getColumns } from '@/features/enrollment/table/columns';
import { EnrollStudentFormDialog } from '@/features/enrollment/enrollment-from';
import { DataTableToolbar } from '@/features/enrollment/table/toolbar';
import { Badge } from '@/components/ui/badge';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useAppDispatch } from '@/app/hooks';
import { openPaymentFormModal } from '@/app/ui-slice';

export default function BatchDetailsPage() {
    const dispatch = useAppDispatch();
    const { id: batchId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [studentIdsToDelete, setStudentIdsToDelete] = React.useState<string[]>([]);

    // Fetch batch details
    const {
        data: batch,
        isLoading: isLoadingBatch,
        isError: isBatchError,
    } = useGetBatchQuery(batchId || '');

    // Fetch enrolled students
    const {
        data: enrollments,
        isLoading: isLoadingEnrollments,
        isError: isEnrollmentError,
    } = useGetEnrollmentsByBatchQuery(batchId || '', {
        skip: !batchId, // Don't fetch until we have a batchId
    });

    const [deleteEnrollment, { isLoading: isDeleting }] = useDeleteEnrollmentMutation();

    const isLoading = isLoadingBatch || isLoadingEnrollments;

    const handleEnrollStudent = () => {
        setIsFormOpen(true);
    };

    // --- UPDATED DELETE HANDLERS ---
    const handleDisenroll = (studentId: string) => {
        // Single delete
        setStudentIdsToDelete([studentId]);
        setIsDeleteAlertOpen(true);
    };

    const handleDeleteSelected = (table: any) => {
        // Multi delete
        const selectedIds = table
            .getFilteredSelectedRowModel()
            .rows.map((row: any) => row.original.studentId as string);
        setStudentIdsToDelete(selectedIds);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!batchId || studentIdsToDelete.length === 0) return;
        try {
            const result = await deleteEnrollment({
                batchId,
                studentIds: studentIdsToDelete,
            }).unwrap();
            toast.success(`Successfully disenrolled ${result.count} student(s).`);
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to disenroll students.');
        } finally {
            setIsDeleteAlertOpen(false);
            setStudentIdsToDelete([]);
        }
    };

    // Define columns for the enrolled students table
    const columns = React.useMemo(
        () =>
            getColumns({
                onViewStudent: (studentId) => {
                    navigate(`/students/${studentId}`);
                },
                onAddPayment: (studentId) => {
                    dispatch(
                        openPaymentFormModal({
                            studentId,
                            batch: { name: batch?.name, value: batchId || '' },
                        })
                    );
                },
                onDisEnroll: handleDisenroll,
            }),
        []
    );

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="text-primary h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (isBatchError || isEnrollmentError || !batch) {
        return (
            <div className="text-destructive-foreground border-destructive/20 bg-destructive/10 flex h-[400px] items-center justify-center rounded-md border p-4">
                <p>Failed to load batch details.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-3xl">{batch.subject}</CardTitle>
                    <CardDescription>{batch.name || 'No name'}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Grid columns={2} className="gap-4">
                        <Flex>
                            <strong className="mr-2">Tutor:</strong>
                            {batch.tutor
                                ? `${batch.tutor.first_name} ${batch.tutor.last_name}`
                                : 'Unassigned'}
                        </Flex>
                        <Flex alignItems="center">
                            <strong>Status:</strong>
                            <Badge variant="outline" className="ml-1 bg-green-500/50">
                                Active
                            </Badge>
                        </Flex>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Enrolled Students</CardTitle>
                        <CardDescription>Manage students enrolled in this batch.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        className="bg-background"
                        columns={columns}
                        data={enrollments || []}
                        toolbar={(table) => (
                            <DataTableToolbar
                                table={table}
                                onEnrollClick={handleEnrollStudent}
                                onUnenrollSelectedClick={() => handleDeleteSelected(table)}
                            />
                        )}
                    />
                </CardContent>
            </Card>

            <EnrollStudentFormDialog
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                batchId={batch.id}
                alreadyEnrolled={enrollments || []}
            />
            <ConfirmDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={confirmDelete}
                title={`Disenroll ${studentIdsToDelete.length} Student(s)?`}
                description="This action cannot be undone. The student(s) will be removed from this batch."
                isLoading={isDeleting}
            />
        </div>
    );
}
