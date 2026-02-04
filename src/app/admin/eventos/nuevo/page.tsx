'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EventForm from '@/components/EventForm';
import { FormSkeleton } from '@/components/Skeleton';
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
            <>
                <Header />
                <div className="admin-container">
                    <Breadcrumbs />
                    <div className="admin-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Cargando...</h3>
                        <FormSkeleton />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="admin-container" id="main-content">
                <Breadcrumbs />
                <div className="admin-header">
                    <h2 className="section-title">Nuevo Evento</h2>
                    <Link href="/admin" className="btn btn-secondary" aria-label="Volver al panel">
                        ← Volver
                    </Link>
                </div>

                <div className="admin-card">
                    <EventForm />
                </div>
            </div>
        </>
    );
}
