'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useGetMyBatchesQuery } from '@/features/batches/batches-api-slice';
import { useGetAttendanceForBatchQuery } from '@/features/attendance/attendance-api-slice';
import { AttendanceForm } from '@/features/attendance/attendance-form';

export default function AttendancePage() {
    const [selectedBatchId, setSelectedBatchId] = React.useState<string | null>(null);
    const [date, setDate] = React.useState<Date>(new Date());

    // 1. Fetch the tutor's assigned batches
    const {
        data: myBatches,
        isLoading: isLoadingBatches,
        isError: _isBatchesError,
    } = useGetMyBatchesQuery();

    // 2. Fetch attendance data, but only if a batch and date are selected
    const formattedDate = format(date, 'yyyy-MM-dd');
    const {
        data: attendanceData,
        isLoading: isLoadingAttendance,
        isError: isAttendanceError,
    } = useGetAttendanceForBatchQuery(
        {
            batchId: selectedBatchId!,
            date: formattedDate,
        },
        {
            skip: !selectedBatchId, // Don't run query if no batch is selected
        }
    );

    const selectedBatch = myBatches?.find((b) => b.id === selectedBatchId);

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-4 text-3xl font-bold">Mark Attendance</h1>
            <p className="text-muted-foreground mb-8">
                Select a batch and date to mark student attendance.
            </p>

            {/* --- Batch and Date Selectors --- */}
            <Card className="mb-8">
                <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Select Batch</label>
                        <Select onValueChange={setSelectedBatchId} disabled={isLoadingBatches}>
                            <SelectTrigger>
                                {isLoadingBatches ? (
                                    <Loader className="size-3 animate-spin" />
                                ) : (
                                    <SelectValue placeholder="Select a batch" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {myBatches?.map((batch) => (
                                    <SelectItem key={batch.id} value={batch.id}>
                                        {batch.name} ({batch.subject})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium">Select Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(newDate) => {
                                        if (newDate) {
                                            setDate(newDate);
                                        }
                                    }}
                                    autoFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* --- Attendance Form --- */}
            {selectedBatchId ? (
                isLoadingAttendance ? (
                    <div className="flex h-[200px] items-center justify-center">
                        <Loader className="text-primary h-8 w-8 animate-spin" />
                    </div>
                ) : isAttendanceError ? (
                    <p className="text-destructive text-center">Failed to load attendance data.</p>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance for: {selectedBatch?.name}</CardTitle>
                            <CardDescription>Date: {format(date, 'PPP')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceForm
                                key={`${selectedBatchId}-${formattedDate}`} // Force re-render on change
                                batchId={selectedBatchId}
                                date={date}
                                attendanceData={attendanceData || []}
                            />
                        </CardContent>
                    </Card>
                )
            ) : (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
                    <p className="text-muted-foreground">
                        Please select a batch to view attendance.
                    </p>
                </div>
            )}
        </div>
    );
}
