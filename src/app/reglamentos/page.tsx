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
        <div style={{ minHeight: '100vh', background: '#F9FBFF', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flexGrow: 1, padding: '3.5rem 1.25rem', maxWidth: '1120px', margin: '0 auto', width: '100%' }}>

                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem',
                        border: '1.5px solid rgba(30, 58, 138, 0.1)',
                        boxShadow: '0 4px 16px rgba(30, 58, 138, 0.08)',
                    }}>
                        <BookOpen size={28} strokeWidth={1.5} style={{ color: '#1E3A8A' }} />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem', fontWeight: 700,
                        color: '#1E3A8A', margin: '0 0 0.75rem',
                        letterSpacing: '-0.03em',
                    }}>
                        Reglamentos y Documentos
                    </h1>
                    <p style={{
                        color: '#94A3B8', fontSize: '0.9375rem',
                        maxWidth: '520px', margin: '0 auto',
                        lineHeight: 1.7,
                    }}>
                        Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem',
                    }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: '200px', borderRadius: '14px',
                                background: 'linear-gradient(110deg, #F1F5F9 30%, #E2E8F0 50%, #F1F5F9 70%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.5s ease-in-out infinite',
                            }} />
                        ))}
                    </div>
                ) : reglamentos.length === 0 ? (
                    /* Empty State */
                    <div style={{
                        textAlign: 'center', padding: '4rem 2rem',
                        background: 'white', borderRadius: '16px',
                        border: '1.5px solid rgba(30, 58, 138, 0.1)',
                        boxShadow: '0 4px 16px rgba(30, 58, 138, 0.05)',
                    }}>
                        <div style={{
                            width: '64px', height: '64px',
                            background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.25rem',
                        }}>
                            <FileText size={28} strokeWidth={1.5} style={{ color: '#94A3B8' }} />
                        </div>
                        <h3 style={{
                            fontWeight: 600, color: '#1E3A8A', margin: '0 0 0.5rem',
                            fontSize: '1.0625rem', letterSpacing: '-0.01em',
                        }}>
                            No hay documentos disponibles
                        </h3>
                        <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
                            Disculpa las molestias, vuelve a revisar pronto.
                        </p>
                    </div>
                ) : (
                    /* Document Cards Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem',
                    }}>
                        {reglamentos.map((reg, index) => (
                            <div
                                key={reg.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    borderRadius: '16px',
                                    padding: '1.75rem',
                                    border: '1.5px solid rgba(30, 58, 138, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '210px',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)',
                                    cursor: 'default',
                                    animation: `fadeSlideUp 0.4s ease ${index * 60}ms both`,
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.boxShadow = '0 16px 48px rgba(30, 58, 138, 0.14), 0 6px 16px rgba(30, 58, 138, 0.06)';
                                    el.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                                    el.style.transform = 'translateY(-4px) scale(1.01)';
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.05)';
                                    el.style.borderColor = 'rgba(30, 58, 138, 0.1)';
                                    el.style.transform = 'translateY(0) scale(1)';
                                }}
                            >
                                <div>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        background: 'linear-gradient(135deg, #EEF2FF, #DBEAFE)',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '1rem',
                                        border: '1px solid rgba(30, 58, 138, 0.08)',
                                    }}>
                                        <FileText size={20} strokeWidth={1.5} style={{ color: '#1E3A8A' }} />
                                    </div>
                                    <h3 style={{
                                        fontWeight: 600, color: '#1E3A8A',
                                        margin: '0 0 0.5rem', fontSize: '0.9375rem',
                                        lineHeight: 1.5, letterSpacing: '-0.01em',
                                    }}>
                                        {reg.titulo}
                                    </h3>
                                    <p style={{
                                        color: '#94A3B8', fontSize: '0.75rem', margin: 0,
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
                                    aria-label={`Descargar ${reg.titulo} en PDF`}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.5rem', width: '100%', padding: '0.625rem 1rem',
                                        background: 'transparent', color: '#1E3A8A',
                                        borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600,
                                        textDecoration: 'none',
                                        border: '1.5px solid rgba(30, 58, 138, 0.15)',
                                        marginTop: '1.25rem',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget;
                                        el.style.background = 'linear-gradient(135deg, #1E3A8A, #2D4BA6)';
                                        el.style.color = '#FFFFFF';
                                        el.style.borderColor = '#1E3A8A';
                                        el.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget;
                                        el.style.background = 'transparent';
                                        el.style.color = '#1E3A8A';
                                        el.style.borderColor = 'rgba(30, 58, 138, 0.15)';
                                        el.style.boxShadow = 'none';
                                    }}
                                >
                                    <Download size={15} strokeWidth={1.5} />
                                    Descargar PDF
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                <style>{`
                    @keyframes fadeSlideUp {
                        from { opacity: 0; transform: translateY(16px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}</style>
            </main>
            <Footer />
        </div>
    );
}
