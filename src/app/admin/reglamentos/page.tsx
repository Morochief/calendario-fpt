'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { createClient } from '@/lib/supabase';
import { Plus, Save, Trash2, FileText, ArrowLeft, Upload, X, BookOpen } from 'lucide-react';

interface Reglamento {
    id: string;
    titulo: string;
    url: string;
    created_at: string;
}

export default function AdminReglamentosPage() {
    const [reglamentos, setReglamentos] = useState<Reglamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const router = useRouter();

    useEffect(() => {
        checkAuthAndLoad();
    }, []);

    async function checkAuthAndLoad() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        loadReglamentos();
    }

    async function loadReglamentos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('reglamentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setReglamentos(data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !titulo) return;

        setUploading(true);
        const supabase = createClient();

        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reglamentos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('reglamentos')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('reglamentos')
                .insert({
                    titulo,
                    url: publicUrl
                });

            if (dbError) throw dbError;

            // Success
            resetForm();
            loadReglamentos();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir el reglamento. Verifica que el bucket "reglamentos" exista y tenga políticas públicas.');
        } finally {
            setUploading(false);
        }
    }

    function resetForm() {
        setTitulo('');
        setFile(null);
        setShowForm(false);
    }

    async function handleDelete(id: string, url: string) {
        if (!confirm('¿Eliminar este reglamento?')) return;

        const supabase = createClient();

        // Extract filename from URL to delete from storage
        const fileName = url.split('/').pop();

        if (fileName) {
            await supabase.storage
                .from('reglamentos')
                .remove([fileName]);
        }

        await supabase.from('reglamentos').delete().eq('id', id);
        loadReglamentos();
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '3px solid #e2e8f0',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flexGrow: 1, padding: '32px 16px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <Breadcrumbs />

                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '24px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            Gestión de Reglamentos
                        </h1>
                        <Link
                            href="/admin"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.9rem',
                                color: '#64748b',
                                textDecoration: 'none',
                                marginTop: '4px'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Volver al panel
                        </Link>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: '#2563eb',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Plus size={18} />
                            Nuevo Reglamento
                        </button>
                    )}
                </div>

                {/* Upload Form */}
                {showForm && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '1.1rem' }}>
                                Nuevo Reglamento
                            </h3>
                            <button
                                onClick={resetForm}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#374151',
                                    marginBottom: '6px'
                                }}>
                                    Título del Reglamento *
                                </label>
                                <input
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Reglamento Técnico IPSC 2024"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    color: '#374151',
                                    marginBottom: '6px'
                                }}>
                                    Archivo PDF *
                                </label>
                                <div style={{
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '8px',
                                    padding: '32px 16px',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}>
                                    <Upload size={40} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#374151' }}>
                                        <span style={{ color: '#2563eb', fontWeight: 500 }}>Subir un archivo</span> o arrastrar y soltar
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                                        PDF hasta 10MB
                                    </p>
                                    {file && (
                                        <p style={{
                                            margin: '12px 0 0',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            color: '#2563eb'
                                        }}>
                                            Seleccionado: {file.name}
                                        </p>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        required
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: '#475569',
                                        background: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 20px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        color: 'white',
                                        background: uploading ? '#94a3b8' : '#2563eb',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: uploading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: 'white',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}></div>
                                            Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Documents List */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BookOpen size={20} style={{ color: '#64748b' }} />
                            <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '1rem' }}>
                                Documentos Publicados
                            </h3>
                        </div>
                        <span style={{
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '999px'
                        }}>
                            {reglamentos.length} archivos
                        </span>
                    </div>

                    {reglamentos.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 24px'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: '#f1f5f9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <FileText size={28} style={{ color: '#94a3b8' }} />
                            </div>
                            <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 4px', fontSize: '1.1rem' }}>
                                No hay reglamentos cargados
                            </p>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                                Sube el primer reglamento utilizando el botón &quot;Nuevo Reglamento&quot;.
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Fecha</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Título</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Archivo</th>
                                        <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 500, color: '#64748b' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reglamentos.map((reg) => (
                                        <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '14px 24px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(reg.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            <td style={{ padding: '14px 24px', fontWeight: 500, color: '#0f172a' }}>
                                                {reg.titulo}
                                            </td>
                                            <td style={{ padding: '14px 24px' }}>
                                                <a
                                                    href={reg.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: '#2563eb',
                                                        fontWeight: 500,
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    <FileText size={16} />
                                                    Ver PDF
                                                </a>
                                            </td>
                                            <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDelete(reg.id, reg.url)}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: '#dc2626',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
