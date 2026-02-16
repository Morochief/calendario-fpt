'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClubCard from '@/components/ClubCard';
import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Club } from '@/lib/types';

export default function ClubesPage() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadClubes() {
            const supabase = createClient();
            const { data } = await supabase
                .from('clubes')
                .select('*')
                .in('estado', ['afiliado', 'pendiente'])
                .order('nombre');

            if (data) setClubes(data);
            setLoading(false);
        }
        loadClubes();
    }, []);

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #1E3A8A 0%, #2548a0 50%, #1E3A8A 100%)',
                        color: 'white',
                        padding: '4rem 1.25rem',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background pattern */}
                    <div style={{
                        position: 'absolute', inset: 0, opacity: 0.05,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />

                    <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1rem',
                        }}>
                            <Building2 size={28} style={{ color: 'white' }} />
                        </div>
                        <h1 style={{
                            fontSize: '2rem', fontWeight: 700,
                            marginBottom: '0.75rem', letterSpacing: '-0.03em',
                        }}>
                            Clubes Participantes
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.6)', maxWidth: '520px',
                            margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.7,
                        }}>
                            Clubes afiliados a la Federación Paraguaya de Tiro que participan en las competencias oficiales de la temporada 2026.
                        </p>
                    </div>
                </div>

                {/* Grid Section */}
                <div style={{ maxWidth: '1120px', margin: '-2rem auto 4rem', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '1.25rem',
                        }}>
                            {clubes.length === 0 ? (
                                <div className="col-span-full text-center py-12 bg-white/80 backdrop-blur rounded-2xl border border-white shadow-sm">
                                    <p className="text-slate-500 font-medium">No se encontraron clubes registrados.</p>
                                </div>
                            ) : (
                                clubes.map((club, index) => (
                                    <div
                                        key={club.id}
                                        className="animate-stagger-in"
                                        style={{ animationDelay: `${index * 80}ms` }}
                                    >
                                        <ClubCard
                                            abbreviation={club.siglas}
                                            name={club.estado === 'pendiente' ? `${club.nombre} (Pendiente)` : club.nombre}
                                            color={club.color || '#1E3A8A'}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

