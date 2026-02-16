'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Evento, Modalidad, TipoEvento } from '@/lib/types';
import { useToast } from '@/components/Toast';

export default function EditarEventoPage() {
    const [loading, setLoading] = useState(true);
    const [evento, setEvento] = useState<Evento | null>(null);
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();

    useEffect(() => {
        const id = params?.id as string;
        if (id) {
            loadEvento(id);
        }
    }, [params]);

    async function loadEvento(id: string) {
        const supabase = createClient();

        // Check Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Fetch Event
        const { data, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error loading event:', error);
            showToast('No se pudo cargar el evento', 'error');
            router.push('/admin');
            return;
        }

        setEvento(data);
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

    if (!evento) return null;

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 animate-page-enter">
                <div className="max-w-main mx-auto space-y-8">
                    <Breadcrumbs />

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-text-elite">Editar Evento</h1>
                            <p className="text-text-secondary mt-1 text-sm">Modifica los detalles del evento seleccionado.</p>
                        </div>

                        <Link
                            href="/admin"
                            className="btn btn-secondary shadow-sm"
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </Link>
                    </div>

                    <EventForm initialData={evento} isEditing={true} />
                </div>
            </main>
        </div>
    );
}
