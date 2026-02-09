'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import { ArrowLeft } from 'lucide-react';
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
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Breadcrumbs />

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Nuevo Evento</h1>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Volver al panel
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 sm:p-8">
                            <EventForm />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
