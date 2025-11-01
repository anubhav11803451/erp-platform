'use client';

import * as React from 'react';
import { useEffect } from 'react';
// Import z to access its types
import type { z } from 'zod';
import {
    // Assuming useZodForm returns this
    type SubmitHandler,
    type UseFormProps,
    type UseFormReturn, // We'll use this for the children prop
    type FieldValues,
    type DefaultValues,
    FormProvider,
} from 'react-hook-form';
import {
    useForm, // We need this
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ErrorMessage from '../ui/error-message';

// A mock for your useZodForm hook
const useZodForm = <TSchema extends z.ZodObject<z.ZodRawShape>>({
    schema,
    defaultValues,
    mode,
}: {
    schema: TSchema;
    defaultValues: DefaultValues<z.input<TSchema> & FieldValues>;
    mode: UseFormProps<z.input<TSchema> & FieldValues>['mode'];
}) => {
    const form = useForm({
        resolver: schema ? zodResolver(schema) : undefined,

        // REMOVE the cast to `z.infer<TSchema>`.
        // `defaultValues` is already correctly typed as z.input<TSchema>.
        // `useForm` will now correctly infer:
        //   - TFieldValues = z.input<TSchema>
        //   - TTransformedValues = z.output<TSchema> (from the resolver)
        defaultValues: defaultValues,

        mode,
    });

    // BONUS: Because the types are now inferred correctly,
    // you no longer need the `as` cast on the return statement.
    // TypeScript knows `form` is the correct type.
    return form;
};

// --- 1. Define SmartFormProps with CORRECTED types ---

type SmartFormProps<
    //Constrain TSchema to be a ZodObject
    TSchema extends z.ZodObject<z.ZodRawShape>,
    // Infer input and output types
    SchemaInput = z.input<TSchema>,
    SchemaOutput = z.output<TSchema>,
> = {
    id?: string;
    schema: TSchema;

    /** Default values must match the schema's INPUT type */
    defaultValues: DefaultValues<SchemaInput>;

    /** onSubmit receives the schema's OUTPUT type */
    onSubmit: SubmitHandler<SchemaOutput>;

    /** Children can be a render prop to access form state */
    children:
        | React.ReactNode
        | ((
              form: UseFormReturn<SchemaInput & FieldValues, SchemaOutput, SchemaOutput>
          ) => React.ReactNode);

    mode?: UseFormProps<SchemaInput & FieldValues>['mode'];
    className?: string;
    submitButtonText?: string;
    showSubmitButton?: boolean;
    resetAfterSubmit?: boolean;
    disableSubmitButton?: boolean;
    disableDirtyCheck?: boolean;
    enableReinitialize?: boolean;
};

// --- 2. Implement SmartForm with CORRECTED generics ---

export function SmartForm<
    // THE FIX (Part 2): Apply the same constraint to the function
    TSchema extends z.ZodObject<z.ZodRawShape>,
>({
    id = 'rhf-smart-form',
    schema,
    defaultValues,
    onSubmit,
    children,
    mode = 'onSubmit',
    className,
    submitButtonText = 'Submit',
    showSubmitButton = true,
    resetAfterSubmit = false,
    disableSubmitButton = false,
    disableDirtyCheck = false,
    enableReinitialize = false,
}: SmartFormProps<TSchema>) {
    // useZodForm is now called with the correctly typed props.
    // We explicitly type `form` based on our assumptions of useZodForm.
    const form = useZodForm({
        schema,
        defaultValues,
        mode,
    });

    useEffect(() => {
        if (enableReinitialize) form.reset(defaultValues);
    }, [defaultValues, enableReinitialize, form]);

    // We explicitly type handleSubmit's `data` argument.
    // `z.infer<TSchema>` is now correctly resolved to `z.output<TSchema>`
    // because TSchema is constrained to a ZodObject.
    // This type now matches what `form.handleSubmit` will provide.
    const handleSubmit: SubmitHandler<z.infer<TSchema>> = async (data) => {
        try {
            // `data` is z.output<TSchema>
            // `onSubmit` prop expects z.output<TSchema>
            // This now matches perfectly.
            await onSubmit?.(data);
        } catch (error: unknown) {
            form.setError('root', {
                message: error instanceof Error ? error.message : 'Something went wrong',
            });
        }
        if (resetAfterSubmit) {
            form.reset();
        }
    };

    return (
        <FormProvider {...form}>
            <form
                id={id}
                onSubmit={form.handleSubmit(handleSubmit)}
                onReset={() => form.reset()}
                className={cn('space-y-4', className)}
            >
                {typeof children === 'function' ? children(form) : children}

                {form.formState.errors.root && (
                    <ErrorMessage align="center">
                        {form.formState.errors.root?.message}
                    </ErrorMessage>
                )}

                {showSubmitButton && (
                    <Button
                        form={id}
                        type="submit"
                        className="mt-4!"
                        disabled={
                            // Your logic is preserved
                            (disableDirtyCheck ? !form.formState.isDirty : false) ||
                            form.formState.isSubmitting ||
                            disableSubmitButton
                        }
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin text-white" />
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                )}
            </form>
        </FormProvider>
    );
}
