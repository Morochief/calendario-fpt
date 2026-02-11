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
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <Breadcrumbs />

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1E3A8A]">
                            Panel de Administración
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Gestiona eventos, inscripciones y configuraciones del sistema.
                        </p>
                    </div>
                    <Link
                        href="/admin/eventos/nuevo"
                        className="inline-flex items-center gap-2 bg-[#D91E18] hover:bg-[#b91c1b] text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold active:scale-95"
                    >
                        <Plus size={20} />
                        Nuevo Evento
                    </Link>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Inscripciones Card */}
                    <Link
                        href="/admin/inscripciones"
                        className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                    >
                        <div className="p-3 bg-green-100 text-green-700 rounded-lg group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Inscripciones</h3>
                            <p className="text-slate-500 text-sm">Ver lista de tiradores</p>
                        </div>
                    </Link>

                    {/* Configuración Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <Settings size={20} className="text-slate-400" />
                            Configuración
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/modalidades" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm">
                                <ClipboardList size={16} />
                                Modalidades
                            </Link>
                            <Link href="/admin/tipos-evento" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm">
                                <Filter size={16} />
                                Tipos
                            </Link>
                            <Link href="/admin/reglamentos" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm">
                                <BookOpen size={16} />
                                Reglamentos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Events Table Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                                <Calendar size={20} className="text-[#1E3A8A]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Eventos Programados</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {eventos.length} total
                                </span>
                            </div>
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar eventos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border-slate-200 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Table Content */}
                    {eventos.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                                <Calendar size={32} className="text-slate-300" />
                            </div>
                            <p className="font-semibold text-slate-900 mb-1">No hay eventos creados</p>
                            <p className="text-slate-500 mb-6 text-sm">Comienza creando tu primer evento para el calendario.</p>
                            <Link
                                href="/admin/eventos/nuevo"
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={16} />
                                Crear evento
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Fecha</th>
                                            <th className="px-6 py-3 font-medium">Título</th>
                                            <th className="px-6 py-3 font-medium">Modalidad</th>
                                            <th className="px-6 py-3 font-medium">Tipo</th>
                                            <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedEventos.map(evento => {
                                            const fecha = new Date(evento.fecha + 'T12:00:00');
                                            return (
                                                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-medium">
                                                        {fecha.toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {evento.titulo}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                                                            style={{
                                                                backgroundColor: `${evento.modalidades?.color}15`,
                                                                color: evento.modalidades?.color
                                                            }}
                                                        >
                                                            <span
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: evento.modalidades?.color }}
                                                            ></span>
                                                            {evento.modalidades?.nombre}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${evento.tipos_evento?.color || '#6B7280'}15`,
                                                                color: evento.tipos_evento?.color || '#6B7280'
                                                            }}
                                                        >
                                                            {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}`}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(evento.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30">
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
