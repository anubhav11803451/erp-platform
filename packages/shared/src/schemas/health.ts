import { z } from 'zod/v4';

export const healthResponseSchema = z.object({
    status: z.literal('ok'),
    timestamp: z.iso.datetime(),
    uptimeSeconds: z.number().int().nonnegative(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
