import { Controller, useFormContext } from 'react-hook-form';

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ReactNode } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ItemGroup } from '@/components/ui/item';

type FormFieldProps = {
    name: string;
    label: string;
    type?: React.HTMLInputTypeAttribute;
    description?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
};

// --- 1. TextField Component ---
type TextFieldProps = FormFieldProps;

export function TextField({
    name,
    label,
    type = 'text',
    placeholder,
    required = false,
    description,
}: TextFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                        {label} {required && <span className="text-red-500">*</span>}
                    </FieldLabel>
                    <Input
                        {...field}
                        id={field.name}
                        type={type}
                        placeholder={placeholder}
                        aria-invalid={fieldState.invalid}
                    />
                    {description && <FieldDescription>{description}</FieldDescription>}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

// --- 2. TextareaField Component ---

type TextareaFieldProps = FormFieldProps & {
    /** Pass a number to show a character counter. */
    maxLength?: number;
    /** Number of rows for the textarea. */
    rows?: number;
};

export function TextareaField({
    name,
    label,
    placeholder,
    required = false,
    description,
    maxLength,
    rows = 6,
}: TextareaFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                        {label} {required && <span className="text-red-500">*</span>}
                    </FieldLabel>
                    <ItemGroup>
                        <Textarea
                            {...field}
                            id={field.name}
                            placeholder={placeholder}
                            rows={rows}
                            className="min-h-24 resize-none"
                            aria-invalid={fieldState.invalid}
                        />
                        {/* Conditionally add the character counter */}
                        {maxLength && (
                            <FieldDescription className="text-end">
                                {field.value.length}/{maxLength} characters
                            </FieldDescription>
                        )}
                    </ItemGroup>
                    {description && <FieldDescription>{description}</FieldDescription>}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

// --- 3. CheckboxField Component ---

type CheckboxFieldProps = Omit<FormFieldProps, 'type' | 'description'>;

export function CheckboxField({ name, label }: CheckboxFieldProps) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-0">
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id={field.name}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                        />
                        <FieldLabel htmlFor={field.name} className="mt-0! text-sm font-normal">
                            {label}
                        </FieldLabel>
                    </div>
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} className="mt-2" />
                    )}
                </Field>
            )}
        />
    );
}

// --- 4. SelectField Component ---
type SelectOption = {
    value: string;
    label: string;
};

type SelectFieldProps<T extends SelectOption> = FormFieldProps & {
    options: T[];
    renderOption?: (option: T) => ReactNode;
    renderOptions?: (options: T[]) => ReactNode;
};

export function SelectField<T extends SelectOption>({
    name,
    label,
    placeholder,
    required = false,
    description,
    options,
}: SelectFieldProps<T>) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`rhf-smart-form-${field.name}`}>
                        {label} {required && <span className="text-red-500">*</span>}
                    </FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                            id={`rhf-smart-form-${field.name}`}
                            disabled={field.disabled}
                            aria-disabled={field.disabled}
                            aria-invalid={fieldState.invalid}
                        >
                            <SelectValue placeholder={placeholder || 'Select an option'} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {description && <FieldDescription>{description}</FieldDescription>}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

// --- 5. RadioField Component ---
type RadioOption = {
    value: string;
    title: string;
    description?: string;
};

type RadioFieldProps<T extends RadioOption> = FormFieldProps & {
    options: T[];
    renderOption?: (option: T) => ReactNode;
    renderOptions?: (options: T[]) => ReactNode;
};

export function RadioField<T extends RadioOption>({
    name,
    label,
    required = false,
    description,
    options,
}: RadioFieldProps<T>) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                    <FieldLegend variant="label" aria-invalid={fieldState.invalid}>
                        {label} {required && <span className="text-red-500">*</span>}
                    </FieldLegend>
                    {description && <FieldDescription>{description}</FieldDescription>}

                    <RadioGroup
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                    >
                        {options.map((option) => (
                            <FieldLabel
                                key={option.value}
                                htmlFor={`rhf-smart-form-${option.value}`}
                            >
                                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                    <FieldContent>
                                        <FieldTitle>{option.title}</FieldTitle>
                                        {option.description && (
                                            <FieldDescription>
                                                {option.description}
                                            </FieldDescription>
                                        )}
                                    </FieldContent>
                                    <RadioGroupItem
                                        value={option.value}
                                        id={`rhf-smart-form-${option.value}`}
                                        aria-invalid={fieldState.invalid}
                                    />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldSet>
            )}
        />
    );
}
