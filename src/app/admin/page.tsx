'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/Toast';
import {
    Plus,
    Calendar,
    Users,
    Settings,
    ClipboardList,
    FileText,
    Edit,
    Trash2,
    Search,
    Filter,
    BookOpen
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import { Evento, Modalidad, TipoEvento } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
    const [eventos, setEventos] = useState<(Evento & { modalidades: Modalidad; tipos_evento?: TipoEvento })[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        setUser(user);
        loadEventos();
    }

    async function loadEventos() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('eventos')
            .select(`
                *,
                modalidades (*),
                tipos_evento (*)
            `)
            .order('fecha', { ascending: false });

        if (!error && data) {
            setEventos(data);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('eventos')
            .delete()
            .eq('id', id);

        if (!error) {
            setEventos(eventos.filter(e => e.id !== id));
            showToast('Evento eliminado correctamente', 'success');
        } else {
            showToast('Error al eliminar el evento', 'error');
        }
    }

    // Filter and Pagination
    const filteredEventos = useMemo(() => {
        return eventos.filter(evento =>
            evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evento.modalidades?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [eventos, searchTerm]);

    const totalPages = Math.ceil(filteredEventos.length / ITEMS_PER_PAGE);
    const paginatedEventos = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEventos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredEventos, currentPage]);

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
            <main style={{ flexGrow: 1, padding: '32px 16px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
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
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            Panel de Administración
                        </h1>
                        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.95rem' }}>
                            Gestiona eventos, inscripciones y configuraciones del sistema.
                        </p>
                    </div>
                    <Link
                        href="/admin/eventos/nuevo"
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
                            textDecoration: 'none',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Plus size={18} />
                        Nuevo Evento
                    </Link>
                </div>

                {/* Quick Actions Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px'
                }}>
                    {/* Inscripciones Card */}
                    <Link
                        href="/admin/inscripciones"
                        style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            transition: 'box-shadow 0.2s'
                        }}
                    >
                        <div style={{
                            padding: '14px',
                            background: '#dcfce7',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Users size={26} style={{ color: '#16a34a' }} />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '1.05rem' }}>Inscripciones</h3>
                            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '0.85rem' }}>Ver lista de tiradores inscritos</p>
                        </div>
                    </Link>

                    {/* Configuración Card */}
                    <div style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{
                            fontWeight: 600,
                            color: '#0f172a',
                            margin: '0 0 16px',
                            fontSize: '1.05rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Settings size={18} style={{ color: '#64748b' }} />
                            Configuración
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <Link href="/admin/modalidades" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderRadius: '8px',
                                textDecoration: 'none',
                                border: '1px solid #e2e8f0'
                            }}>
                                <ClipboardList size={16} />
                                Modalidades
                            </Link>
                            <Link href="/admin/tipos-evento" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderRadius: '8px',
                                textDecoration: 'none',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Filter size={16} />
                                Tipos
                            </Link>
                            <Link href="/admin/reglamentos" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                borderRadius: '8px',
                                textDecoration: 'none',
                                border: '1px solid #e2e8f0'
                            }}>
                                <BookOpen size={16} />
                                Reglamentos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Events Table Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    {/* Table Header */}
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={20} style={{ color: '#64748b' }} />
                            <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '1rem' }}>
                                Eventos Programados
                            </h3>
                            <span style={{
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                padding: '3px 10px',
                                borderRadius: '999px'
                            }}>
                                {eventos.length}
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }} />
                            <input
                                type="text"
                                placeholder="Buscar eventos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: '38px',
                                    paddingRight: '16px',
                                    paddingTop: '8px',
                                    paddingBottom: '8px',
                                    fontSize: '0.9rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    width: '220px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    {eventos.length === 0 ? (
                        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                margin: '0 auto 16px',
                                background: '#f1f5f9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Calendar size={28} style={{ color: '#94a3b8' }} />
                            </div>
                            <p style={{ fontWeight: 600, color: '#0f172a', margin: '0 0 4px', fontSize: '1.1rem' }}>
                                No hay eventos creados
                            </p>
                            <p style={{ color: '#64748b', margin: '0 0 20px', fontSize: '0.9rem' }}>
                                Comienza creando tu primer evento para el calendario.
                            </p>
                            <Link
                                href="/admin/eventos/nuevo"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#0f172a',
                                    color: 'white',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    textDecoration: 'none'
                                }}
                            >
                                <Plus size={16} />
                                Crear evento
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Fecha</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Título</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Modalidad</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: 500, color: '#64748b' }}>Tipo</th>
                                            <th style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 500, color: '#64748b' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedEventos.map(evento => {
                                            const fecha = new Date(evento.fecha + 'T12:00:00');
                                            return (
                                                <tr key={evento.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '14px 24px', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                        {fecha.toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td style={{ padding: '14px 24px', fontWeight: 500, color: '#0f172a' }}>
                                                        {evento.titulo}
                                                    </td>
                                                    <td style={{ padding: '14px 24px' }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            background: `${evento.modalidades?.color}15`,
                                                            color: evento.modalidades?.color
                                                        }}>
                                                            <span style={{
                                                                width: '6px',
                                                                height: '6px',
                                                                borderRadius: '50%',
                                                                background: evento.modalidades?.color
                                                            }}></span>
                                                            {evento.modalidades?.nombre}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 24px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 500,
                                                            background: `${evento.tipos_evento?.color || '#6B7280'}15`,
                                                            color: evento.tipos_evento?.color || '#6B7280'
                                                        }}>
                                                            {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}`}
                                                                style={{
                                                                    padding: '6px',
                                                                    color: '#64748b',
                                                                    borderRadius: '6px',
                                                                    display: 'inline-flex'
                                                                }}
                                                                title="Editar"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(evento.id)}
                                                                style={{
                                                                    padding: '6px',
                                                                    color: '#64748b',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex'
                                                                }}
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    totalItems={filteredEventos.length}
                                    itemsPerPage={ITEMS_PER_PAGE}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
