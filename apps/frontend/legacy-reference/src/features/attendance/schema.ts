import { recordSchema } from '@erp/shared';
import z from 'zod';

export const rowSchema = recordSchema.extend({
    name: z.string(),
});
export const formSchema = z.object({
    records: z.array(rowSchema),
});

export type RowValuesType = z.infer<typeof rowSchema>;
export type FormValuesType = z.infer<typeof formSchema>;
