import { useMarkAttendanceMutation } from '@/features/attendance/attendance-api-slice';
import { formSchema, type FormValuesType } from '@/features/attendance/schema';
import { getApiErrorMessage } from '@/lib/utils';
import { AttendanceStatus } from '@erp/shared';
import { type BatchAttendanceResponse, markAttendanceSchema } from '@erp/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type UseAttendanceFormProps = {
    batchId: string;
    date: Date;
    attendanceData: BatchAttendanceResponse[];
};

export function useAttendanceForm({ batchId, date, attendanceData }: UseAttendanceFormProps) {
    const [markAttendance, { isLoading }] = useMarkAttendanceMutation();

    const defaultValues = useMemo(() => {
        return attendanceData.map((record) => ({
            studentId: record.student.id,
            name: `${record.student.first_name} ${record.student.last_name}`,
            status: record.status || AttendanceStatus.Present, // Default to 'Present'
            notes: record.notes || '',
        }));
    }, [attendanceData]);

    const form = useForm<FormValuesType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            records: defaultValues,
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: 'records',
    });

    const onSubmit = async (data: FormValuesType) => {
        // Transform data into the DTO shape our backend expects
        const payload = {
            batchId,
            date: date.toISOString(),
            records: data.records.map((att) => ({
                studentId: att.studentId,
                status: att.status,
                notes: att.notes || undefined,
            })),
        };

        // Validate with the shared Zod schema before sending
        const validation = markAttendanceSchema.safeParse(payload);
        if (!validation.success) {
            toast.error('Validation Error: ' + validation.error.message);
            return;
        }

        try {
            const result = await markAttendance(validation.data).unwrap();
            toast.success(result.message);
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to save attendance.'));
        }
    };

    const setAllStatus = (status: AttendanceStatus) => {
        form.setValue(
            'records',
            fields.map((field) => ({ ...field, status }))
        );
    };

    return {
        form,
        fields,
        isLoading,
        defaultValues,
        onSubmit,
        setAllStatus,
    };
}
