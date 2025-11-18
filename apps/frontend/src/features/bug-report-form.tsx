import { Fragment } from 'react';
import { toast } from 'sonner';

import type { SubmitHandler } from 'react-hook-form';

// Import your smart form components
import { SmartForm } from '@/components/smart-form'; // Assuming your SmartForm is here
import {
    CheckboxField,
    RadioField,
    SelectField,
    TextField,
    TextareaField,
} from '@/components/smart-form/form-fields';

// Import shadcn/ui components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup } from '@/components/ui/field';
import { Toaster } from '@/components/ui/sonner';
import { createSmartFormSchema, z } from '@/components/smart-form/create-schema';

// 1. Define the schema (same as original)
const formSchema = createSmartFormSchema(
    z.object({
        title: z
            .string()
            .min(5, 'Bug title must be at least 5 characters.')
            .max(32, 'Bug title must be at most 32 characters.'),
        description: z
            .string()
            .min(20, 'Description must be at least 20 characters.')
            .max(100, 'Description must be at most 100 characters.'),
        privacy: z.boolean(),
        priority: z
            .string({
                error: 'Please select priority',
            })
            .min(1, 'You must select a priority to continue.'),
        plan: z.string().min(1, 'You must select a subscription plan to continue.'),
    })
);

// Infer the output type for the submit handler
type FormValues = z.infer<typeof formSchema>;

export function SmartBugReportForm() {
    // 2. Define the submit handler (same as original)
    const onSubmit: SubmitHandler<FormValues> = (data) => {
        toast('You submitted the following values:', {
            description: (
                <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
                    <code>{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
            position: 'bottom-right',
            classNames: {
                content: 'flex flex-col gap-2',
            },
            style: {
                '--border-radius': 'calc(var(--radius) + 4px)',
            } as React.CSSProperties,
        });
        console.log(data);
    };

    return (
        <Fragment>
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>Bug Report</CardTitle>
                    <CardDescription>
                        Help us improve by reporting bugs you encounter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SmartForm
                        id="bug-report-form"
                        schema={formSchema}
                        onSubmit={onSubmit}
                        defaultValues={{
                            title: '',
                            description: '',
                            privacy: false,
                            priority: '',
                            plan: '',
                        }}
                        showSubmitButton={false} // We want to render our own buttons
                        className="space-y-0" // Disable default spacing to use Card's
                    >
                        <FieldGroup>
                            <TextField
                                name="title"
                                label="Bug Title"
                                placeholder="Login button not working on mobile"
                                required
                            />
                            <TextareaField
                                name="description"
                                label="Description"
                                placeholder="I'm having an issue with the login button..."
                                description="Include steps to reproduce, expected behavior, and what actually happened."
                                maxLength={100}
                                required
                            />
                            <CheckboxField name="privacy" label="I agree to share my bug report." />
                            <SelectField
                                name="priority"
                                label="Priority"
                                options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                ]}
                            />
                            <RadioField
                                name="plan"
                                label="Plan"
                                options={[
                                    {
                                        title: 'Basic',
                                        value: 'basic',
                                        // description: 'For individuals and small teams',
                                    },
                                    {
                                        title: 'Pro',
                                        value: 'pro',
                                        // description: 'For businesses with higher demands',
                                    },
                                ]}
                            />
                        </FieldGroup>
                    </SmartForm>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">
                        <Button type="reset" form="bug-report-form" variant="outline">
                            Reset
                        </Button>
                        <Button form="bug-report-form" type="submit">
                            Submit
                        </Button>
                    </Field>
                </CardFooter>
            </Card>
            <Toaster />
        </Fragment>
    );
}
