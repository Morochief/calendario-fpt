'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isAllowedAdmin } from '@/lib/utils';
import { useToast } from '@/components/Toast';

export default function EditarEventoPage() {
    const [loading, setLoading] = useState(true);
    const [evento, setEvento] = useState<any | null>(null); // Changed to 'any' to match new loadEvento structure
    const router = useRouter();
    const params = useParams();
    const { showToast } = useToast();



    async function loadEvento(id: string) {
        const supabase = createClient();

        // Check Auth - This part was in the original loadEvento but not in the provided new one.
        // Assuming it should still be there for security.
        const { data: { user } = { user: null } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Check if user is admin
        if (!isAllowedAdmin(user.email)) {
            router.push('/');
            return;
        }

        try {
            const { data: eventoData, error } = await supabase
                .from('eventos')
                .select(`
                    *,
                    modalidad:modalidades(*),
                    tipo:tipos_evento(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!eventoData) throw new Error('Evento no encontrado');

            setEvento(eventoData);


        } catch (error) {
            console.error('Error al cargar evento:', error);
            showToast('Error al cargar el evento', 'error');
            router.push('/admin');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const id = params?.id as string;
        if (id) {
            loadEvento(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

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
