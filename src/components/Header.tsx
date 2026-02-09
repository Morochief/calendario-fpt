'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import UserDropdown from './UserDropdown';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const isAdmin = pathname?.startsWith('/admin');

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }: any) => {
            setUser(data.user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        showToast('Sesión cerrada correctamente', 'info');
        router.push('/admin/login');
        router.refresh(); // Ensure state updates propagate
    }

    return (
        <header className="header">
            <Link href="/" className="header-logo">
                <Image
                    src="/logo.jpg"
                    alt="Federación Paraguaya de Tiro"
                    width={60}
                    height={60}
                    style={{ objectFit: 'contain' }}
                />
                <div className="header-title">
                    <h1>FEDERACIÓN PARAGUAYA DE TIRO</h1>
                    <span>CALENDARIO DE ACTIVIDADES {new Date().getFullYear()}</span>
                </div>
            </Link>
            <nav className="header-nav">
                <Link href="/" style={{
                    background: !isAdmin && pathname !== '/reglamentos' ? 'rgba(255,255,255,0.15)' : 'transparent'
                }}>
                    📅 Calendario
                </Link>
                <Link href="/reglamentos" style={{
                    background: pathname === '/reglamentos' ? 'rgba(255,255,255,0.15)' : 'transparent'
                }}>
                    📂 Reglamentos
                </Link>
                <Link href="/tiradores" style={{
                    background: pathname === '/tiradores' ? 'rgba(255,255,255,0.15)' : 'transparent'
                }}>
                    👥 Tiradores
                </Link>
                {user ? (
                    <UserDropdown email={user.email} onLogout={handleLogout} />
                ) : (
                    <Link href="/admin" style={{
                        background: isAdmin ? 'rgba(255,255,255,0.15)' : 'transparent'
                    }}>
                        ⚙️ Admin
                    </Link>
                )}
            </nav>
        </header>
    );
}
