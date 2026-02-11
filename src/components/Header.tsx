'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import UserDropdown from './UserDropdown';
import { Calendar, FileText, Users, Settings, Menu, X } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
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

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        showToast('Sesión cerrada correctamente', 'info');
        router.push('/admin/login');
        router.refresh();
    }

    return (
        <header className="header">
            <Link href="/" className="header-logo">
                <Image
                    src="/logo fpdt.svg"
                    alt="Federación Paraguaya de Tiro"
                    width={56}
                    height={56}
                    unoptimized
                    style={{ objectFit: 'contain' }}
                />
                <div className="header-title">
                    <h1>FPT</h1>
                    <span>Federación Paraguaya de Tiro</span>
                </div>
            </Link>

            <button
                className="header-menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>

            <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
                <Link href="/">
                    <Calendar size={16} strokeWidth={1.5} />
                    <span>Calendario</span>
                </Link>
                <Link href="/reglamentos">
                    <FileText size={16} strokeWidth={1.5} />
                    <span>Reglamentos</span>
                </Link>
                <Link href="/tiradores">
                    <Users size={16} strokeWidth={1.5} />
                    <span>Tiradores</span>
                </Link>
                {user ? (
                    <UserDropdown email={user.email} onLogout={handleLogout} />
                ) : (
                    <Link href="/admin">
                        <Settings size={16} strokeWidth={1.5} />
                        <span>Admin</span>
                    </Link>
                )}
            </nav>
        </header>
    );
}
