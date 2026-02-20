import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { env } from '@/lib/env';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isAllowedAdmin(email: string | undefined | null): boolean {
    if (!email) return false;
    const adminEmailsStr = env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@fpdt.org.py,admin@fpt.com,admin@fptd.com.py';
    const allowedEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());
    return allowedEmails.includes(email.toLowerCase());
}
