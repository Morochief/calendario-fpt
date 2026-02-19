'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import UserDropdown from './UserDropdown';
import { Calendar, FileText, Users, Settings, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { showToast } = useToast();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [isAdmin, setIsAdmin] = useState<any>(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        showToast('Sesión cerrada correctamente', 'info');
        router.push('/admin/login');
        router.refresh();
    }

    return (
        <header className={cn(
            "flex items-center justify-between",
            "h-[64px] px-10",
            "bg-white/85 backdrop-blur-[var(--backdrop-blur-header)]",
            "border-b border-[var(--color-border)]",
            "sticky top-0 z-[var(--z-header)]",
            "transition-shadow duration-normal"
        )}>
            <Link href="/" className="flex items-center gap-3.5 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/LOGO_FPDT-removebg-preview.svg"
                    alt="Federación Paraguaya de Tiro"
                    style={{
                        height: '48px',
                        width: 'auto',
                        objectFit: 'contain',
                        imageRendering: 'auto',
                        flexShrink: 0,
                    }}
                    className="transition-transform duration-300 group-hover:scale-105"
                />
                <div className="flex flex-col">
                    <h1 className="text-base font-semibold text-text-elite tracking-elite leading-tight">FPDT</h1>
                    <span className="text-xs text-text-muted font-normal tracking-normal">Federación Paraguaya de Tiro</span>
                </div>
            </Link>

            <button
                className="md:hidden p-2 text-text-elite rounded-elite-sm hover:bg-cop-blue/5 active:scale-95 transition-all duration-fast"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={menuOpen}
            >
                {menuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
                {[
                    { href: '/', label: 'Calendario', icon: Calendar },
                    { href: '/reglamentos', label: 'Reglamentos', icon: FileText },
                    { href: '/clubes', label: 'Clubes', icon: Users },
                ].map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2",
                            "px-3.5 py-2 rounded-elite-sm",
                            "text-sm font-medium text-text-secondary",
                            "transition-all duration-fast",
                            "hover:text-text-elite hover:bg-cop-blue/5",
                            "relative"
                        )}
                    >
                        <item.icon size={16} strokeWidth={1.5} />
                        <span>{item.label}</span>
                    </Link>
                ))}

                {/* Bandera Paraguaya */}
                <div className="mx-2" title="Paraguay">
                    <svg width="22" height="15" viewBox="0 0 5 3" style={{ borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        <rect width="5" height="1" fill="#D52B1E" />
                        <rect y="1" width="5" height="1" fill="#FFFFFF" />
                        <rect y="2" width="5" height="1" fill="#0038A8" />
                    </svg>
                </div>

                {user ? (
                    <UserDropdown email={user.email} onLogout={handleLogout} />
                ) : (
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-2",
                            "px-3.5 py-2 rounded-elite-sm",
                            "text-sm font-medium text-text-secondary",
                            "transition-all duration-fast",
                            "hover:text-text-elite hover:bg-cop-blue/5"
                        )}
                    >
                        <Settings size={16} strokeWidth={1.5} />
                        <span>Admin</span>
                    </Link>
                )}
            </nav>

            {/* Mobile Nav Drawer */}
            {menuOpen && (
                <div className="absolute top-[64px] left-0 w-full bg-white border-b border-gray-100 shadow-lg md:hidden flex flex-col p-4 gap-2 animate-in slide-in-from-top-2">
                    {[
                        { href: '/', label: 'Calendario', icon: Calendar },
                        { href: '/reglamentos', label: 'Reglamentos', icon: FileText },
                        { href: '/clubes', label: 'Clubes', icon: Users },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            <item.icon size={18} strokeWidth={2} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                    <div className="h-px bg-gray-100 my-2" />
                    {user ? (
                        <>
                            <Link
                                href="/admin"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                                <Settings size={18} strokeWidth={2} />
                                <span className="font-medium">Panel Admin</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                                <X size={18} strokeWidth={2} />
                                <span className="font-medium">Cerrar Sesión ({user.email})</span>
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                            <Settings size={18} strokeWidth={2} />
                            <span className="font-medium">Admin</span>
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
