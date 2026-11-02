'use client';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { AttendanceStatus, type BatchAttendanceResponse } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { RadioField, TextareaField } from '@/components/smart-form/form-fields';
import { useAttendanceForm } from '@/hooks/forms/use-attendance-form';
import { formSchema } from './schema';
import { Field, FieldSet } from '@/components/ui/field';
import { Flex } from '@/components/ui/flex';

type AttendanceFormProps = {
    batchId: string;
    date: Date;
    attendanceData: BatchAttendanceResponse[];
};

export function AttendanceForm({ batchId, date, attendanceData }: AttendanceFormProps) {
    const { isLoading, fields, form, onSubmit, setAllStatus } = useAttendanceForm({
        batchId,
        date,
        attendanceData,
    });
    return (
        <SmartForm id="mark-attendance-form" _form={form} onSubmit={onSubmit} schema={formSchema}>
            <Flex className="justify-end-safe gap-2">
                <Button
                    id="mark-attendance-form-mark-all-present-button"
                    type="submit"
                    variant="outline"
                    className="bg-green-500/60! text-white hover:bg-green-500/70!"
                    size="sm"
                    onClick={() => setAllStatus(AttendanceStatus.Present)}
                >
                    Mark All Present
                </Button>
                <Button
                    id="mark-attendance-form-mark-all-absent-button"
                    type="submit"
                    variant="destructive"
                    size="sm"
                    onClick={() => setAllStatus(AttendanceStatus.Absent)}
                >
                    Mark All Absent
                </Button>
            </Flex>

            <FieldSet className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] pl-4">Student</TableHead>
                            <TableHead className="w-[300px]">Status</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell className="pl-4 font-medium">{field.name}</TableCell>
                                <TableCell>
                                    <RadioField
                                        name={`records.${index}.status`}
                                        options={[
                                            { value: AttendanceStatus.Present, title: 'Present' },
                                            { value: AttendanceStatus.Absent, title: 'Absent' },
                                            { value: AttendanceStatus.Late, title: 'Late' },
                                        ]}
                                    />
                                </TableCell>
                                <TableCell className="pr-4">
                                    <TextareaField
                                        name={`records.${index}.notes`}
                                        placeholder="Optional notes..."
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </FieldSet>
            <Field orientation="horizontal" className="flex justify-end">
                <Button id="mark-attendance-form-submit-button" type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Attendance'}
                </Button>
            </Field>
        </SmartForm>
    );
}
