'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import { TableSkeleton } from '@/components/Skeleton';
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
    Filter
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
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Breadcrumbs />

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
                            <p className="text-slate-500 mt-1">Gestiona eventos, inscripciones y configuraciones del sistema.</p>
                        </div>
                        <Link
                            href="/admin/eventos/nuevo"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={18} />
                            Nuevo Evento
                        </Link>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/inscripciones" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Inscripciones</h3>
                                    <p className="text-sm text-slate-500">Ver lista de tiradores inscritos</p>
                                </div>
                            </div>
                        </Link>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-slate-400" />
                                Configuración
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Link href="/admin/modalidades" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                                    <ClipboardList size={16} />
                                    Modalidades
                                </Link>
                                <Link href="/admin/tipos-evento" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                                    <Filter size={16} />
                                    Tipos
                                </Link>
                                <Link href="/admin/reglamentos" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                                    <FileText size={16} />
                                    Reglamentos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar size={20} className="text-slate-400" />
                                <h3 className="font-semibold text-slate-900">
                                    Eventos Programados
                                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {eventos.length}
                                    </span>
                                </h3>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar eventos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-full sm:w-64"
                                />
                            </div>
                        </div>

                        {eventos.length === 0 ? (
                            <div className="p-8">
                                <EmptyState
                                    icon={<Calendar size={48} className="text-slate-300" />}
                                    title="No hay eventos creados"
                                    description="Comienza creando tu primer evento para el calendario."
                                    actionLabel="Crear evento"
                                    actionHref="/admin/eventos/nuevo"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3">Fecha</th>
                                                <th className="px-6 py-3">Título</th>
                                                <th className="px-6 py-3">Modalidad</th>
                                                <th className="px-6 py-3">Tipo</th>
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {paginatedEventos.map(evento => {
                                                const fecha = new Date(evento.fecha + 'T12:00:00');
                                                return (
                                                    <tr key={evento.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                            {fecha.toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-900">
                                                            {evento.titulo}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                                                                style={{
                                                                    backgroundColor: `${evento.modalidades?.color}15`,
                                                                    color: evento.modalidades?.color,
                                                                }}
                                                            >
                                                                <span
                                                                    className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ backgroundColor: evento.modalidades?.color }}
                                                                />
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
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Link
                                                                    href={`/admin/eventos/${evento.id}`}
                                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <Edit size={16} />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(evento.id)}
                                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                <div className="px-6 py-4 border-t border-slate-200">
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
                </div>
            </main>
        </div>
    );
}
