'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';

// Inactivity timeout in milliseconds (e.g., 60 minutes = 3600000 ms)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export default function AutoLogout() {
    const router = useRouter();
    const pathname = usePathname();
    const { showToast } = useToast();

    useEffect(() => {
        // Only run inactivity timer on admin routes (except login)
        if (!pathname?.startsWith('/admin') || pathname === '/admin/login') {
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const logout = async () => {
            console.log("Auto-logout due to inactivity.");
            const supabase = createClient();
            await supabase.auth.signOut();
            showToast("Sesión cerrada por inactividad.", "error");
            router.push('/admin/login');
        };

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT);
        };

        // Events that indicate user activity
        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

        // Attach listeners
        events.forEach((event) => {
            window.addEventListener(event, resetTimer, { passive: true });
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [pathname, router, showToast]);

    return null; // This is a logic-only component
}
