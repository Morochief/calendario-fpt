'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import UserDropdown from './UserDropdown';
import { Calendar, FileText, Users, Settings } from 'lucide-react';

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
        router.refresh();
    }

    const getLinkStyle = (isActive: boolean) => ({
        background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
        opacity: isActive ? 1 : 0.8
    });

    return (
        <header className="header">
            <Link href="/" className="header-logo">
                <Image
                    src="/logo.jpg"
                    alt="Federación Paraguaya de Tiro"
                    width={48}
                    height={48}
                    style={{ objectFit: 'contain', borderRadius: '50%' }}
                />
                <div className="header-title">
                    <h1>FPT</h1>
                    <span>Federación Paraguaya de Tiro</span>
                </div>
            </Link>
            <nav className="header-nav">
                <Link href="/" style={getLinkStyle(!isAdmin && pathname !== '/reglamentos' && pathname !== '/tiradores')}>
                    <Calendar size={18} />
                    <span>Calendario</span>
                </Link>
                <Link href="/reglamentos" style={getLinkStyle(pathname === '/reglamentos')}>
                    <FileText size={18} />
                    <span>Reglamentos</span>
                </Link>
                <Link href="/tiradores" style={getLinkStyle(pathname === '/tiradores')}>
                    <Users size={18} />
                    <span>Tiradores</span>
                </Link>
                {user ? (
                    <UserDropdown email={user.email} onLogout={handleLogout} />
                ) : (
                    <Link href="/admin" style={getLinkStyle(isAdmin)}>
                        <Settings size={18} />
                        <span>Admin</span>
                    </Link>
                )}
            </nav>
        </header>
    );
}
