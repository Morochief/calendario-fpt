'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/Toast';
import {
    Plus,
    Calendar,
    Users,
    Settings,
    ClipboardList,
    Filter,
    BookOpen,
    Edit,
    Trash2,
    Search,
    Loader2
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import { Evento, Modalidad, TipoEvento } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
    const [eventos, setEventos] = useState<(Evento & { modalidades: Modalidad; tipos_evento?: TipoEvento })[]>([]);
    const [loading, setLoading] = useState(true);
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
            <div className="min-h-screen bg-bg-elite flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-cop-blue animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <Breadcrumbs />

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-10">
                    <div>
                        <h1 className="text-4xl font-bold text-cop-blue tracking-tight">
                            Panel de Administración
                        </h1>
                        <p className="text-text-secondary mt-2 text-lg font-light">
                            Gestiona eventos, inscripciones y configuraciones del sistema.
                        </p>
                    </div>
                    <Link
                        href="/admin/eventos/nuevo"
                        className="inline-flex items-center gap-2 bg-fpt-red hover:bg-[#b91c1b] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold active:scale-95"
                    >
                        <Plus size={20} />
                        Nuevo Evento
                    </Link>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Inscripciones Card */}
                    <Link
                        href="/admin/inscripciones"
                        className="group bg-surface p-6 rounded-xl border border-border-elite shadow-sm hover:shadow-md transition-all flex items-center gap-5 hover:border-border-hover"
                    >
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-text-elite text-xl">Inscripciones</h3>
                            <p className="text-text-muted text-sm mt-1">Ver lista de tiradores</p>
                        </div>
                    </Link>

                    {/* Configuración Card */}
                    <div className="bg-surface p-6 rounded-xl border border-border-elite shadow-sm col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="font-bold text-text-elite text-xl mb-6 flex items-center gap-3">
                            <Settings size={22} className="text-text-muted" strokeWidth={1.5} />
                            Configuración
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/admin/modalidades" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-elite hover:bg-slate-100 text-text-secondary rounded-lg border border-border-elite transition-colors font-medium text-sm hover:border-gray-300">
                                <ClipboardList size={18} strokeWidth={1.5} />
                                Modalidades
                            </Link>
                            <Link href="/admin/tipos-evento" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-elite hover:bg-slate-100 text-text-secondary rounded-lg border border-border-elite transition-colors font-medium text-sm hover:border-gray-300">
                                <Filter size={18} strokeWidth={1.5} />
                                Tipos
                            </Link>
                            <Link href="/admin/reglamentos" className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-elite hover:bg-slate-100 text-text-secondary rounded-lg border border-border-elite transition-colors font-medium text-sm hover:border-gray-300">
                                <BookOpen size={18} strokeWidth={1.5} />
                                Reglamentos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Events Table Card */}
                <div className="bg-surface rounded-xl shadow-sm border border-border-elite overflow-hidden">
                    {/* Table Header */}
                    <div className="p-6 border-b border-border-elite bg-bg-elite/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-white rounded-lg border border-border-elite shadow-xs">
                                <Calendar size={22} className="text-cop-blue" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-elite text-lg">Eventos Programados</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mt-1">
                                    {eventos.length} total
                                </span>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-auto group">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-cop-blue transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar eventos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full sm:w-72 rounded-lg border-border-elite bg-white shadow-sm focus:border-cop-blue focus:ring-1 focus:ring-cop-blue text-sm transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    {eventos.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-bg-elite rounded-full flex items-center justify-center border border-border-elite">
                                <Calendar size={40} className="text-text-muted" strokeWidth={1.5} />
                            </div>
                            <p className="font-bold text-text-elite text-lg mb-2">No hay eventos creados</p>
                            <p className="text-text-secondary mb-8">Comienza creando tu primer evento para el calendario.</p>
                            <Link
                                href="/admin/eventos/nuevo"
                                className="inline-flex items-center gap-2 bg-cop-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                                Crear evento
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-text-muted uppercase bg-bg-elite border-b border-border-elite">
                                        <tr>
                                            <th className="px-8 py-4 font-semibold tracking-wider">Fecha</th>
                                            <th className="px-8 py-4 font-semibold tracking-wider">Título</th>
                                            <th className="px-8 py-4 font-semibold tracking-wider">Modalidad</th>
                                            <th className="px-8 py-4 font-semibold tracking-wider">Tipo</th>
                                            <th className="px-8 py-4 font-semibold tracking-wider text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-elite">
                                        {paginatedEventos.map(evento => {
                                            const fecha = new Date(evento.fecha + 'T12:00:00');
                                            return (
                                                <tr key={evento.id} className="hover:bg-bg-elite/50 transition-colors group">
                                                    <td className="px-8 py-5 text-text-secondary whitespace-nowrap font-medium">
                                                        {fecha.toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-8 py-5 font-semibold text-text-elite text-base">
                                                        {evento.titulo}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span
                                                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                                                            style={{
                                                                backgroundColor: `${evento.modalidades?.color}10`,
                                                                color: evento.modalidades?.color,
                                                                borderColor: `${evento.modalidades?.color}20`
                                                            }}
                                                        >
                                                            <span
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: evento.modalidades?.color }}
                                                            ></span>
                                                            {evento.modalidades?.nombre}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span
                                                            className="inline-flex px-3 py-1 rounded-full text-xs font-semibold border"
                                                            style={{
                                                                backgroundColor: `${evento.tipos_evento?.color || '#94A3B8'}10`,
                                                                color: evento.tipos_evento?.color || '#94A3B8',
                                                                borderColor: `${evento.tipos_evento?.color || '#94A3B8'}20`
                                                            }}
                                                        >
                                                            {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}`}
                                                                className="p-2 text-text-muted hover:text-cop-blue hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Editar"
                                                            >
                                                                <Edit size={18} strokeWidth={1.5} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(evento.id)}
                                                                className="p-2 text-text-muted hover:text-fpt-red hover:bg-red-50 rounded-lg transition-all"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 size={18} strokeWidth={1.5} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-8 py-5 border-t border-border-elite bg-bg-elite/20">
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
