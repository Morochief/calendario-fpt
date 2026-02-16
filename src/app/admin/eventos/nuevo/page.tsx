'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EliteCard from '@/components/ui/EliteCard';
import EventForm from '@/components/EventForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NuevoEventoPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Check if user is admin
        const allowedAdmins = ['admin@fpdt.org.py', 'admin@fpt.com'];
        if (!user.email || !allowedAdmins.includes(user.email)) {
            router.push('/');
            return;
        }

        setLoading(false);
    }

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-elite flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-cop-blue animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite relative overflow-hidden selection-elite">
            {/* ════════════════════════════════════════════════════════════════════════
                WATERMARKS (Institutional Identity)
                ════════════════════════════════════════════════════════════════════════ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] opacity-[0.03] pointer-events-none -rotate-12 z-0">
                <img src="/logo_cop-removebg-preview.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] opacity-[0.04] pointer-events-none rotate-12 z-0">
                <img src="/LOGO_FPDT-removebg-preview.svg" alt="" className="w-full h-full object-contain" />
            </div>

            <Header />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 animate-page-enter relative z-10">
                <div className="max-w-admin mx-auto space-y-10">
                    <Breadcrumbs />

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-cop-blue tracking-tight">
                                Nuevo Evento
                            </h1>
                            <p className="text-text-secondary font-medium max-w-xl leading-relaxed">
                                Completa el formulario para registrar una nueva competencia oficial en el calendario nacional.
                            </p>
                        </div>

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm shadow-sm transition-all duration-300 hover:text-cop-blue hover:border-cop-blue hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            Administración
                        </Link>
                    </div>

                    <EliteCard title="Formulario de Competencia" contentClassName="p-0 sm:p-0">
                        <div className="p-6 sm:p-8">
                            <EventForm />
                        </div>
                    </EliteCard>
                </div>
            </main>
        </div>
    );
}
