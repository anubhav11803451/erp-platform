import { Controller, useFormContext } from 'react-hook-form';
import type { InstitutionAttendanceMarkStatus } from '@erp/shared';
import { Button } from '@/components/ui/button';
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';

const choices: Array<{ value: InstitutionAttendanceMarkStatus | null; label: string }> = [
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
    { value: null, label: 'Unmarked' },
];

export function AttendanceMarkField({
    name,
    studentName,
    disabled,
}: {
    name: string;
    studentName: string;
    disabled?: boolean;
}) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <FieldSet className="gap-2">
                    <FieldLegend variant="label">{`Attendance status for ${studentName}`}</FieldLegend>
                    <FieldDescription>Select one status.</FieldDescription>
                    <div className="grid grid-cols-3 gap-2">
                        {choices.map((choice) => {
                            const selected = (field.value ?? null) === choice.value;
                            return (
                                <Button
                                    key={choice.label}
                                    type="button"
                                    variant={selected ? 'default' : 'outline'}
                                    className="px-2"
                                    aria-pressed={selected}
                                    aria-label={`${choice.label} for ${studentName}`}
                                    disabled={disabled}
                                    onClick={() => field.onChange(choice.value)}
                                >
                                    {choice.label}
                                </Button>
                            );
                        })}
                    </div>
                </FieldSet>
            )}
        />
    );
}
