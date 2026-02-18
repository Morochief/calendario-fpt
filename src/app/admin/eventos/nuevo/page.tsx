'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EliteCard from '@/components/ui/EliteCard';
import EventForm from '@/components/EventForm';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isAllowedAdmin } from '@/lib/utils';

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
        if (!isAllowedAdmin(user.email)) {
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 relative overflow-hidden">
            {/* ════════════════════════════════════════════════════════════════════════
                WATERMARKS (Institutional Identity)
                ════════════════════════════════════════════════════════════════════════ */}
            <div className="absolute top-[15%] left-[-5%] w-[600px] h-[600px] opacity-[0.02] pointer-events-none -rotate-12 z-0">
                <img src="/logo_cop-removebg-preview.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] opacity-[0.03] pointer-events-none rotate-12 z-0">
                <img src="/LOGO_FPDT-removebg-preview.svg" alt="" className="w-full h-full object-contain" />
            </div>

            <Header />

            {/* ════════════════════════════════════════════════════════════════════════
                VIBRANT HERO SECTION (Institutional Blue)
                ════════════════════════════════════════════════════════════════════════ */}
            <div className="bg-[#1E3A8A] text-white pt-16 pb-24 px-4 relative overflow-hidden border-b-4 border-[#D91E18] shadow-xl">
                {/* Background Glow effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

                <div className="max-w-admin mx-auto relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <Breadcrumbs className="text-white/80 hover:text-white" />
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm shadow-sm transition-all duration-300 hover:bg-white/20 hover:shadow-md hover:-translate-y-0.5 active:scale-95 group"
                        >
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            Administración
                        </Link>
                    </div>

                    <div className="space-y-3">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl ring-1 ring-white/10 mb-2">
                            <Plus size={32} className="text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">
                            Nuevo <span className="text-[#D91E18]">Evento</span>
                        </h1>
                        <p className="text-blue-100/80 font-medium max-w-2xl leading-relaxed text-lg">
                            Registra una nueva competencia oficial en el calendario nacional de la Federación.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═ MAIN FORM AREA (Negative Margin Overlap) ═ */}
            <main className="flex-grow pb-24 px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="max-w-admin mx-auto animate-page-enter">
                    <EliteCard
                        title="Formulario de Competencia"
                        contentClassName="p-0 sm:p-0"
                        className="shadow-2xl shadow-blue-900/15"
                    >
                        <EventForm />
                    </EliteCard>
                </div>
            </main>
        </div>
    );
}
