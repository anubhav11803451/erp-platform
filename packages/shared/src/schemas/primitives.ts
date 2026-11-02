import { z } from 'zod/v4';

export const legalEntityCodeSchema = z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/);

export const institutionCodeSuffixSchema = z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/);

export const institutionFullCodeSchema = z
    .string()
    .trim()
    .toUpperCase()
    .min(5)
    .max(25)
    .refine((value) => {
        for (
            let separator = value.indexOf('-');
            separator !== -1;
            separator = value.indexOf('-', separator + 1)
        ) {
            if (
                legalEntityCodeSchema.safeParse(value.slice(0, separator)).success &&
                institutionCodeSuffixSchema.safeParse(value.slice(separator + 1)).success
            ) {
                return true;
            }
        }
        return false;
    }, 'Institution code must combine a valid LegalEntity code and suffix');

export const normalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());
export const normalizedEmailResponseSchema = z
    .email()
    .refine((value) => value === value.trim().toLowerCase(), {
        message: 'Email address must be normalized',
    });
