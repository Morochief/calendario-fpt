'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { FileText, Download, FileQuestion } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface Reglamento {
    id: string;
    titulo: string;
    url: string;
    created_at: string;
}

export default function PublicReglamentosPage() {
    const [reglamentos, setReglamentos] = useState<Reglamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReglamentos();
    }, []);

    async function loadReglamentos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('reglamentos')
            .select('*')
            .order('titulo');

        if (data) {
            setReglamentos(data);
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto space-y-10">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
                            Reglamentos y Documentos
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm border border-slate-100"></div>
                            ))}
                        </div>
                    ) : reglamentos.length === 0 ? (
                        <div className="max-w-md mx-auto py-12">
                            <EmptyState
                                icon={<FileQuestion size={48} className="text-slate-300" />}
                                title="No hay documentos disponibles"
                                description="Disculpa las molestias, vuelve a revisar pronto."
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reglamentos.map(reg => (
                                <div
                                    key={reg.id}
                                    className="group bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
                                >
                                    <div className="mb-6">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                                            <FileText size={24} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                                            {reg.titulo}
                                        </h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            Publicado: {new Date(reg.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <a
                                        href={reg.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 group-hover:border-slate-300"
                                    >
                                        <Download size={16} />
                                        Descargar PDF
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
