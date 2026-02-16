'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { FileText, Download, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reglamento {
    id: string;
    titulo: string;
    url: string;
    created_at: string;
}

export default function PublicReglamentosPage() {
    const [reglamentos, setReglamentos] = useState<Reglamento[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadReglamentos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('reglamentos')
            .select('*')
            .order('titulo');

        if (data) setReglamentos(data);
        setLoading(false);
    }

    useEffect(() => {
        loadReglamentos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Fixed Watermark Background - FPDT Lion in color */}
            <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/LOGO_FPDT-removebg-preview.svg"
                    alt="FPDT Watermark"
                    className="w-[90vw] max-w-[900px] h-auto object-contain"
                />
            </div>

            <Header />
            <main className="flex-grow relative z-10">
                {/* Hero Section */}
                <div className="bg-[#1E3A8A] text-white py-20 px-4 text-center relative overflow-hidden shadow-lg border-b-4 border-[#D91E18]">
                    {/* Background Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

                    <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl ring-1 ring-white/10">
                            <BookOpen size={36} className="text-white" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight drop-shadow-sm uppercase">
                            Reglamentos y <span className="text-red-500">Documentos</span>
                        </h1>
                        <p className="text-blue-100/90 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                            Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                        </p>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-20">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-[240px] rounded-2xl bg-white/80 animate-pulse border border-white/40 shadow-sm" />
                            ))}
                        </div>
                    ) : reglamentos.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-lg max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={32} className="text-slate-400" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                No hay documentos disponibles
                            </h3>
                            <p className="text-slate-500">
                                Disculpa las molestias, vuelve a revisar pronto.
                            </p>
                        </div>
                    ) : (
                        /* Document Cards Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reglamentos.map((reg, index) => (
                                <div
                                    key={reg.id}
                                    className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[220px] overflow-hidden"
                                    style={{ animation: `fadeSlideUp 0.5s ease ${index * 100}ms both` }}
                                >
                                    {/* Top Border Accent */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                                    <div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:border-blue-600 transition-colors duration-300">
                                            <FileText size={22} className="text-blue-700 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                                            {reg.titulo}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                            Publicado: {new Date(reg.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <a
                                        href={reg.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-700 font-semibold text-sm transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:shadow-md"
                                    >
                                        <Download size={16} strokeWidth={2} />
                                        Descargar PDF
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <style>{`
                    @keyframes fadeSlideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </main>
            <Footer />
        </div>
    );
}
