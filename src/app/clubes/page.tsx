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
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Fixed Watermark Background */}
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo_cop-removebg-preview.svg"
                    alt="COP Watermark"
                    className="w-[80vw] max-w-[800px] h-auto grayscale"
                />
            </div>

            <Header />
            <main className="flex-grow relative z-10">
                {/* Hero Section */}
                <div className="bg-[#1E3A8A] text-white py-20 px-4 text-center relative overflow-hidden shadow-lg">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')]" />
                    <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-red-600 via-white to-blue-600 opacity-80" />

                    <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl">
                            <Building2 size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-sm">
                            Clubes Participantes
                        </h1>
                        <p className="text-blue-100/80 max-w-xl mx-auto text-lg leading-relaxed font-light">
                            Clubes afiliados a la Federación Paraguaya de Tiro que participan en las competencias oficiales de la temporada 2026.
                        </p>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-20 relative z-20">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {clubes.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200">
                                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium text-lg">No se encontraron clubes registrados.</p>
                                </div>
                            ) : (
                                clubes.map((club, index) => (
                                    <div
                                        key={club.id}
                                        className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                                        style={{ animationDelay: `${index * 100}ms` }}
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

