import { Controller, useFormContext } from 'react-hook-form';
import { FieldDescription, FieldError, FieldLegend, FieldSet } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type CheckboxGroupFieldProps = {
    name: string;
    idPrefix: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    description?: string;
    disabled?: boolean;
    emptyMessage?: string;
};

export function CheckboxGroupField({
    name,
    idPrefix,
    label,
    options,
    description,
    disabled,
    emptyMessage,
}: CheckboxGroupFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const selectedValues = Array.isArray(field.value)
                    ? field.value.filter((value): value is string => typeof value === 'string')
                    : [];
                const errorId = `${idPrefix}-error`;
                return (
                    <FieldSet
                        data-invalid={fieldState.invalid}
                        aria-describedby={[
                            description ? `${idPrefix}-description` : null,
                            fieldState.invalid ? errorId : null,
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <FieldLegend variant="label">{label}</FieldLegend>
                        {description && (
                            <FieldDescription id={`${idPrefix}-description`}>
                                {description}
                            </FieldDescription>
                        )}
                        {options.length === 0 ? (
                            emptyMessage && (
                                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
                            )
                        ) : (
                            <div className="grid gap-1 sm:grid-cols-2">
                                {options.map((option) => {
                                    const id = `${idPrefix}-${option.value}`;
                                    return (
                                        <Label
                                            key={option.value}
                                            htmlFor={id}
                                            className="rounded-md border px-3 py-2"
                                        >
                                            <Checkbox
                                                id={id}
                                                checked={selectedValues.includes(option.value)}
                                                disabled={disabled}
                                                aria-invalid={fieldState.invalid}
                                                onCheckedChange={(checked) =>
                                                    field.onChange(
                                                        checked === true
                                                            ? [...selectedValues, option.value]
                                                            : selectedValues.filter(
                                                                  (value) => value !== option.value
                                                              )
                                                    )
                                                }
                                            />
                                            <span>{option.label}</span>
                                        </Label>
                                    );
                                })}
                            </div>
                        )}
                        {fieldState.invalid && (
                            <FieldError id={errorId} errors={[fieldState.error]} />
                        )}
                    </FieldSet>
                );
            }}
        />
    );
}
