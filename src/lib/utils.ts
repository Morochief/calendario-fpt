import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const ALLOWED_ADMINS = ['admin@fpdt.org.py', 'admin@fpt.com', 'admin@fptd.com.py'];

export function isAllowedAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    return ALLOWED_ADMINS.includes(email);
}
