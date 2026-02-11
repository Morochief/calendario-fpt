'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import EmptyState from '@/components/EmptyState';
import { createClient } from '@/lib/supabase';
import { EventoInput } from '@/lib/schemas';
import { ArrowLeft, Search } from 'lucide-react';

interface EventoData extends Partial<EventoInput> {
    id: string;
}

export default function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [evento, setEvento] = useState<EventoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkAuthAndLoad();
    }, [id]);

    async function checkAuthAndLoad() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Load evento
        const { data: eventoData, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !eventoData) {
            setNotFound(true);
        } else {
            setEvento({
                id: eventoData.id,
                titulo: eventoData.titulo,
                modalidad_id: eventoData.modalidad_id,
                fecha: eventoData.fecha,
                hora: eventoData.hora || '08:30',
                ubicacion: eventoData.ubicacion || '',
                descripcion: eventoData.descripcion || '',
                tipo_evento_id: eventoData.tipo_evento_id || '',
            });
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

    if (notFound) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Breadcrumbs />
                        <div className="mt-8">
                            <EmptyState
                                icon={<Search size={48} className="text-slate-300" />}
                                title="Evento no encontrado"
                                description="El evento que buscas no existe o fue eliminado."
                                actionLabel="Volver al panel"
                                actionHref="/admin"
                            />
                        </div>
                    </div>
                </main>
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
                        <h1 className="text-2xl font-bold text-slate-900">Editar Evento</h1>
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Volver al panel
                        </Link>
                    </div>

                    <EventForm initialData={evento!} isEditing />
                </div>
            </main>
        </div>
    );
}
