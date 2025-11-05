import { nanoid } from '@reduxjs/toolkit';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getId(length: number = 4) {
    return nanoid(length);
}

/**
 * Reusable API error handler for toast messages.
 * This function parses NestJS error responses.
 *
 * @param err The error object from a RTK Query catch block (e.g., `err: any`)
 * @param defaultError An optional fallback message.
 * @returns A user-friendly error string.
 */
export function getApiErrorMessage(
    err: any,
    defaultError = 'An error occurred. Please try again.'
): string {
    if (!err || !err.data) {
        return defaultError;
    }

    const message = err.data.message;

    if (Array.isArray(message)) {
        // Case 1: NestJS ValidationPipe error (e.g., ['email must be an email'])
        // We'll capitalize the first letter and join
        return message.map((msg: string) => msg.charAt(0).toUpperCase() + msg.slice(1)).join(', ');
    }

    if (typeof message === 'string') {
        // Case 2: NestJS HttpException (e.g., 'Student already enrolled')
        return message;
    }

    // Case 3: Fallback
    return defaultError;
}
