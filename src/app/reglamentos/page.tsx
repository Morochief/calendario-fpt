'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase';
import { TableSkeleton } from '@/components/Skeleton';

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
            .order('titulo'); // Alphabetical order for public view often makes more sense

        if (data) {
            setReglamentos(data);
        }
        setLoading(false);
    }

    return (
        <>
            <Header />
            <main className="main">
                <div className="admin-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                    <div className="admin-header" style={{ marginBottom: '3rem', textAlign: 'center', flexDirection: 'column', gap: '1rem' }}>
                        <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Reglamentos y Documentos</h2>
                        <p style={{ color: '#6B7280', maxWidth: '600px', margin: '0 auto' }}>
                            Accede a la documentación oficial, reglamentos técnicos y normativas vigentes del Club Paraguayo de Tiro Práctico.
                        </p>
                    </div>

                    {loading ? (
                        <div className="calendar-grid">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="admin-card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="spinner"></div>
                                </div>
                            ))}
                        </div>
                    ) : reglamentos.length === 0 ? (
                        <div className="admin-card" style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📂</div>
                            <h3 style={{ marginBottom: '1rem' }}>No hay documentos disponibles</h3>
                            <p style={{ color: '#6B7280' }}>Disculpa las molestias, vuelve a revisar pronto.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {reglamentos.map(reg => (
                                <div key={reg.id} className="admin-card" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            marginBottom: '1rem',
                                            width: '48px',
                                            height: '48px',
                                            background: '#EFF6FF',
                                            color: '#2563EB',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        }}>
                                            📄
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                            {reg.titulo}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                                            Publicado: {new Date(reg.created_at).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>

                                    <a
                                        href={reg.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{
                                            width: '100%',
                                            justifyContent: 'center',
                                            background: '#f3f4f6',
                                            color: '#1f2937',
                                            border: '1px solid #e5e7eb'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#e5e7eb';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = '#f3f4f6';
                                        }}
                                    >
                                        ⏬ Descargar PDF
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
