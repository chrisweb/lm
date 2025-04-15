import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * utility for merging tailwind classes conditionally
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}