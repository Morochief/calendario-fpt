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
        <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flexGrow: 1, padding: '3.5rem 1.25rem', maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <BookOpen size={26} strokeWidth={1.5} style={{ color: '#737373' }} />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#171717',
                        margin: '0 0 0.75rem',
                        letterSpacing: '-0.03em'
                    }}>
                        Reglamentos y Documentos
                    </h1>
                    <p style={{
                        color: '#A3A3A3',
                        fontSize: '0.9375rem',
                        maxWidth: '520px',
                        margin: '0 auto',
                        lineHeight: 1.7
                    }}>
                        Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem'
                    }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton" style={{
                                height: '200px',
                            }}></div>
                        ))}
                    </div>
                ) : reglamentos.length === 0 ? (
                    /* Empty State */
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.25rem'
                        }}>
                            <FileText size={28} strokeWidth={1.5} style={{ color: '#A3A3A3' }} />
                        </div>
                        <h3 style={{ fontWeight: 600, color: '#171717', margin: '0 0 0.5rem', fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
                            No hay documentos disponibles
                        </h3>
                        <p style={{ color: '#A3A3A3', margin: 0, fontSize: '0.875rem' }}>
                            Disculpa las molestias, vuelve a revisar pronto.
                        </p>
                    </div>
                ) : (
                    /* Document Cards Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem'
                    }}>
                        {reglamentos.map(reg => (
                            <div
                                key={reg.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '14px',
                                    padding: '1.75rem',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '200px',
                                    transition: 'box-shadow 0.25s ease, border-color 0.25s ease'
                                }}
                            >
                                <div>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        background: 'rgba(0,0,0,0.03)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.125rem'
                                    }}>
                                        <FileText size={20} strokeWidth={1.5} style={{ color: '#737373' }} />
                                    </div>
                                    <h3 style={{
                                        fontWeight: 600,
                                        color: '#171717',
                                        margin: '0 0 0.5rem',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.5,
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {reg.titulo}
                                    </h3>
                                    <p style={{
                                        color: '#A3A3A3',
                                        fontSize: '0.75rem',
                                        margin: 0
                                    }}>
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
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '0.5rem 1rem',
                                        background: 'transparent',
                                        color: '#171717',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        marginTop: '1.25rem',
                                        transition: 'all 0.2s ease'
                                    }}
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
