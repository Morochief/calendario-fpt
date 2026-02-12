'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NuevoEventoPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FBFF] flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-[#1E3A8A] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FBFF] flex flex-col font-sans text-[#1E3A8A]">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Breadcrumbs />

                    <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1E3A8A] tracking-tight">Nuevo Evento</h1>
                            <p className="text-slate-500 mt-1 text-sm">Ingresa los detalles para crear una nueva competencia.</p>
                        </div>

                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#1E3A8A] transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200"
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                        <EventForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
