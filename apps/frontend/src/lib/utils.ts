import { nanoid } from '@reduxjs/toolkit';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getId(length: number = 4) {
    return nanoid(length);
}
