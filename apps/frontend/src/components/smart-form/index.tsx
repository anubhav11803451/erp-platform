'use client';

import * as React from 'react';
import { useEffect } from 'react';
import type { z } from 'zod/v4';
import {
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
        defaultValues: defaultValues,
        mode,
    });
    return form;
};

type SmartFormProps<
    TSchema extends z.ZodObject<z.ZodRawShape>,
    SchemaInput extends FieldValues = z.input<TSchema>,
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
        | ((form: UseFormReturn<SchemaInput, unknown, SchemaOutput>) => React.ReactNode);
    mode?: UseFormProps<SchemaInput>['mode'];
    className?: string;
    submitButtonText?: string;
    showSubmitButton?: boolean;
    resetAfterSubmit?: boolean;
    disableSubmitButton?: boolean;
    disableDirtyCheck?: boolean;
    enableReinitialize?: boolean;
};

export function SmartForm<TSchema extends z.ZodObject<z.ZodRawShape>>({
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues, enableReinitialize]);

    const handleSubmit: SubmitHandler<z.infer<TSchema>> = async (data) => {
        try {
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
                        className="mt-4! w-full"
                        disabled={
                            (disableDirtyCheck ? !form.formState.isDirty : false) ||
                            form.formState.isSubmitting ||
                            disableSubmitButton
                        }
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            submitButtonText
                        )}
                    </Button>
                )}
            </form>
        </FormProvider>
    );
}
