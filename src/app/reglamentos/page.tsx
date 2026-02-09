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
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flexGrow: 1, padding: '48px 16px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
                {/* Hero Section */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#dbeafe',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <BookOpen size={32} style={{ color: '#2563eb' }} />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '0 0 12px',
                        letterSpacing: '-0.025em'
                    }}>
                        Reglamentos y Documentos
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '1.05rem',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        Accede a la documentación oficial, reglamentos técnicos y normativas vigentes de la Federación Paraguaya de Tiro.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                background: '#e2e8f0',
                                borderRadius: '12px',
                                height: '200px',
                                animation: 'pulse 1.5s infinite'
                            }}></div>
                        ))}
                    </div>
                ) : reglamentos.length === 0 ? (
                    /* Empty State */
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#f1f5f9',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <FileText size={36} style={{ color: '#94a3b8' }} />
                        </div>
                        <h3 style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 8px', fontSize: '1.2rem' }}>
                            No hay documentos disponibles
                        </h3>
                        <p style={{ color: '#64748b', margin: 0 }}>
                            Disculpa las molestias, vuelve a revisar pronto.
                        </p>
                    </div>
                ) : (
                    /* Document Cards Grid */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {reglamentos.map(reg => (
                            <div
                                key={reg.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '200px'
                                }}
                            >
                                <div>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: '#dbeafe',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <FileText size={24} style={{ color: '#2563eb' }} />
                                    </div>
                                    <h3 style={{
                                        fontWeight: 600,
                                        color: '#0f172a',
                                        margin: '0 0 8px',
                                        fontSize: '1.05rem',
                                        lineHeight: 1.4
                                    }}>
                                        {reg.titulo}
                                    </h3>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.85rem',
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
                                        gap: '8px',
                                        width: '100%',
                                        padding: '10px 16px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        border: '1px solid #e2e8f0',
                                        marginTop: '16px'
                                    }}
                                >
                                    <Download size={16} />
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
