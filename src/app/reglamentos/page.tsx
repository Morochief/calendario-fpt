'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { FileText, Download, BookOpen } from 'lucide-react';

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
        <div className="min-h-screen bg-bg-elite flex flex-col">
            <Header />
            <main className="flex-grow py-14 px-5 max-w-[1120px] mx-auto w-full animate-page-enter">
                {/* Hero Section */}
                <div className="text-center mb-14">
                    <div className="w-14 h-14 bg-blue-50 rounded-elite-md flex items-center justify-center mx-auto mb-5">
                        <BookOpen size={26} strokeWidth={1.5} className="text-cop-blue" />
                    </div>
                    <h1 className="text-[1.75rem] font-semibold text-text-elite m-0 mb-3 tracking-[-0.03em]">
                        Reglamentos y Documentos
                    </h1>
                    <p className="text-text-muted text-[0.9375rem] max-w-[520px] mx-auto leading-relaxed">
                        Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton h-[200px] rounded-elite-md" />
                        ))}
                    </div>
                ) : reglamentos.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16 px-8 bg-surface rounded-elite-lg border border-border-elite">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FileText size={28} strokeWidth={1.5} className="text-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text-elite m-0 mb-2 text-[1.0625rem] tracking-[-0.01em]">
                            No hay documentos disponibles
                        </h3>
                        <p className="text-text-muted m-0 text-sm">
                            Disculpa las molestias, vuelve a revisar pronto.
                        </p>
                    </div>
                ) : (
                    /* Document Cards Grid */
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                        {reglamentos.map((reg, index) => (
                            <div
                                key={reg.id}
                                className="bg-surface rounded-elite-md p-7 border border-border-elite flex flex-col justify-between min-h-[200px] transition-all duration-250 ease-smooth hover:shadow-elite-md hover:-translate-y-0.5 hover:border-border-hover animate-stagger-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div>
                                    <div className="w-11 h-11 bg-blue-50 rounded-[10px] flex items-center justify-center mb-4">
                                        <FileText size={20} strokeWidth={1.5} className="text-cop-blue" />
                                    </div>
                                    <h3 className="font-semibold text-text-elite m-0 mb-2 text-[0.9375rem] leading-normal tracking-[-0.01em]">
                                        {reg.titulo}
                                    </h3>
                                    <p className="text-text-muted text-xs m-0">
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
                                    className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 bg-transparent text-text-elite rounded-elite-sm text-[0.8125rem] font-medium no-underline border border-border-elite mt-5 transition-all duration-200 hover:shadow-elite-sm hover:border-border-hover hover:bg-blue-50/30 active:scale-[0.97]"
                                    aria-label={`Descargar ${reg.titulo} en PDF`}
                                >
                                    <Download size={15} strokeWidth={1.5} />
                                    Descargar PDF
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
