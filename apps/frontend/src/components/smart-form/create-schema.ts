import type { ZodObject, ZodRawShape } from 'zod';

/**
 * A helper function to create and type-check schemas for <SmartForm>.
 *
 * This function doesn't modify the schema. Its only job is to
 * enforce a TypeScript constraint, ensuring that any schema
 * passed to it is a `z.ZodObject`, which is the required
 * type for our `SmartForm` component.
 * 
 * @example 
 * import { createSmartFormSchema,z } from '@components/smart-form';
 * 
 * const schema = createSmartFormSchema(
    z.object({
        name: z.string(),
        email: z.string().email(),
    })
 )
 */
export function createSmartFormSchema<TSchema extends ZodObject<ZodRawShape>>(
    schema: TSchema
): TSchema {
    return schema;
}

export * as z from 'zod';
