'use client';

import * as React from 'react';
import { useParams } from 'react-router';
import { Loader2, User, Users, Home, Phone, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetStudentQuery } from '@/features/students/student-api-slice';
import {
    useGetPaymentsByStudentQuery,
    useDeletePaymentMutation,
} from '@/features/payments/payments-api-slice';
import { getPaymentColumns } from '@/features/payments/table/columns';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FlexItem } from '@/components/ui/flex-item';
import { useAppDispatch } from '@/app/hooks';
import { openPaymentFormModal } from '@/app/ui-slice';
import type { EnrichedPayment } from '@erp/shared';
import { useFeatureAccess } from '@/hooks/use-feature-access';

export default function StudentDetailsPage() {
    const dispatch = useAppDispatch();

    const { id: studentId } = useParams<{ id: string }>();
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [paymentToDelete, setPaymentToDelete] = React.useState<string | null>(null);

    // --- Data Fetching ---
    const {
        data: student,
        isLoading: isLoadingStudent,
        isError: isStudentError,
    } = useGetStudentQuery(studentId || '');

    const {
        data: payments,
        isLoading: isLoadingPayments,
        // isError: isPaymentsError,
    } = useGetPaymentsByStudentQuery(studentId || '', {
        skip: !studentId,
    });

    const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation();

    const isLoading = isLoadingStudent || isLoadingPayments;

    const { canAccess } = useFeatureAccess();

    // --- Action Handlers ---
    const handleAddPayment = () => {
        if (studentId) {
            dispatch(openPaymentFormModal({ studentId }));
        }
    };

    const handleEditPayment = (payment: EnrichedPayment) => {
        // We'll wire this up later
        // toast.info('Edit payment feature not yet implemented. Payment ID: ' + payment.id);
        dispatch(openPaymentFormModal({ studentId: payment.studentId, paymentToEdit: payment }));
    };

    const handleDeletePayment = (paymentId: string) => {
        setPaymentToDelete(paymentId);
        setIsDeleteAlertOpen(true);
    };

    const confirmDelete = async () => {
        if (!paymentToDelete) return;
        try {
            await deletePayment(paymentToDelete).unwrap();
            toast.success('Payment deleted successfully.');
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to delete payment.');
        } finally {
            setIsDeleteAlertOpen(false);
            setPaymentToDelete(null);
        }
    };

    // Define columns for the payments table
    const columns = React.useMemo(
        () =>
            getPaymentColumns({
                onEdit: handleEditPayment,
                onDelete: handleDeletePayment,
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

    if (isStudentError || !student) {
        return (
            <div className="text-destructive-foreground border-destructive/20 bg-destructive/10 flex h-[400px] items-center justify-center rounded-md border p-4">
                <p>Failed to load student details.</p>
            </div>
        );
    }

    return (
        <>
            {/* --- Student Info Cards --- */}
            <div className="my-10 grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <User />
                            {student.first_name} {student.last_name}
                        </CardTitle>
                        <CardDescription>{student.email || 'No email provided'}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center">
                            <Phone className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>{student.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center">
                            <Home className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>{student.school_name || 'No school provided'}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Users />
                            Guardian
                        </CardTitle>
                        <CardDescription>
                            {student.guardian?.email || 'No email provided'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center">
                            <User className="text-muted-foreground mr-2 h-4 w-4" />
                            <span>
                                {student.guardian
                                    ? `${student.guardian.first_name} ${student.guardian.last_name}`
                                    : 'No guardian provided'}
                            </span>
                        </div>
                        {student.guardian && (
                            <div className="flex items-center">
                                <Phone className="text-muted-foreground mr-2 h-4 w-4" />
                                <span>{student.guardian.phone || 'No phone provided'}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* We can add a "Batches Enrolled" card here later */}
            </div>

            {/* --- Payments History Table --- */}
            <Card className="mt-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <FlexItem className="space-y-1.5">
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>All payments logged for this student.</CardDescription>
                    </FlexItem>
                    <Button
                        size="sm"
                        onClick={handleAddPayment}
                        disabled={!canAccess('PAYMENT.ADD')}
                    >
                        <PlusCircle className="h-4 w-4" />
                        Add Payment
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={payments || []} />
                </CardContent>
            </Card>

            {/* --- Dialogs --- */}
            {/* {studentId && (
                <PaymentFormDialog
                    isOpen={isPaymentFormOpen}
                    setIsOpen={setIsPaymentFormOpen}
                    studentId={studentId}
                    paymentToEdit={paymentToEdit}
                />
            )} */}

            <ConfirmDialog
                isOpen={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
                onConfirm={confirmDelete}
                title="Delete Payment?"
                description="This action cannot be undone. This will permanently delete the payment record."
                isLoading={isDeleting}
            />
        </>
    );
}
