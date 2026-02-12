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
            <div className="min-h-screen bg-bg-elite flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-cop-blue animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 animate-page-enter">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Breadcrumbs />

                    <div className="flex items-center justify-between border-b border-border-elite pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-text-elite tracking-tight">Nuevo Evento</h1>
                            <p className="text-text-secondary mt-1 text-sm">Ingresa los detalles para crear una nueva competencia.</p>
                        </div>

                        <Link
                            href="/admin"
                            className="btn btn-secondary shadow-sm"
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </Link>
                    </div>

                    <div className="bg-surface rounded-xl shadow-elite-sm border border-border-elite p-8">
                        <EventForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
