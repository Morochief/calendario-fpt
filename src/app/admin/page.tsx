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
    Loader2,
    Download,
    ChevronRight,
    Home
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import { Evento, Modalidad, TipoEvento } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
    const [eventos, setEventos] = useState<(Evento & {
        modalidades: Modalidad;
        tipos_evento?: TipoEvento;
        inscripciones?: { count: number }[];
    })[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterModalidad, setFilterModalidad] = useState('');
    const [filterTipo, setFilterTipo] = useState('');

    // Derived Data for Filters (Unique values)
    const uniqueModalidades = useMemo(() => {
        const mods = new Set(eventos.map(e => e.modalidades?.nombre).filter(Boolean));
        return Array.from(mods).sort();
    }, [eventos]);

    const uniqueTipos = useMemo(() => {
        const tipos = new Set(eventos.map(e => e.tipos_evento?.nombre || e.tipo).filter(Boolean));
        return Array.from(tipos).sort();
    }, [eventos]);

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
                tipos_evento (*),
                inscripciones (count)
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

    // Determine Event Status
    function getEventStatus(fecha: string): 'activo' | 'finalizado' | 'borrador' {
        const eventDate = new Date(fecha + 'T23:59:59');
        const now = new Date();
        return eventDate < now ? 'finalizado' : 'activo'; // Simple logic for now
    }

    // Filter Logic
    const filteredEventos = useMemo(() => {
        return eventos.filter(evento => {
            const matchesSearch =
                evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.modalidades?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesModalidad = filterModalidad ? evento.modalidades?.nombre === filterModalidad : true;

            const matchesTipo = filterTipo ? (evento.tipos_evento?.nombre === filterTipo || evento.tipo === filterTipo) : true;

            const status = getEventStatus(evento.fecha);
            const matchesEstado = filterEstado ? status === filterEstado : true;

            return matchesSearch && matchesModalidad && matchesTipo && matchesEstado;
        });
    }, [eventos, searchTerm, filterModalidad, filterTipo, filterEstado]);

    // KPI Calculations
    const kpiTotal = eventos.length;

    // Calculate total inscriptions dynamically
    const kpiInscripciones = useMemo(() => {
        return eventos.reduce((acc, curr) => acc + (curr.inscripciones?.[0]?.count || 0), 0);
    }, [eventos]);
    // Find next event
    const nextEvent = useMemo(() => {
        const now = new Date();
        // Sort by date ascending to find the nearest future event
        const futureEvents = eventos
            .filter(e => new Date(e.fecha + 'T23:59:59') >= now)
            .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        return futureEvents[0];
    }, [eventos]);
    const kpiModalidadesCount = uniqueModalidades.length;

    // Pagination
    const totalPages = Math.ceil(filteredEventos.length / ITEMS_PER_PAGE);
    const paginatedEventos = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEventos.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredEventos, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FBFF] flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-[#1E3A8A] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FBFF] flex flex-col font-sans text-[#1E3A8A]">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

                {/* ========== BREADCRUMB ========== */}
                <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center flex-wrap gap-2 text-sm text-slate-500">
                        <li className="flex items-center gap-2">
                            <Link className="flex items-center gap-1 hover:text-blue-600 transition-colors" href="/">
                                <Home size={14} />
                                <span>Inicio</span>
                            </Link>
                            <ChevronRight size={14} className="text-slate-300" />
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-medium text-slate-900">
                                <Settings size={14} />
                                <span>Admin</span>
                            </span>
                        </li>
                    </ol>
                </nav>

                {/* ========== HEADER CON ACCIONES ========== */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 my-10">
                    <div>
                        <h1 className="text-4xl font-bold text-[#1E3A8A] tracking-tight">Panel de Administración</h1>
                        <p className="text-slate-500 mt-2 text-lg font-light">Gestiona eventos, inscripciones y configuraciones del sistema.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Botón exportar (Placeholder) */}
                        <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all font-semibold active:scale-95 text-sm"
                            title="Exportar eventos" onClick={() => showToast('Funcionalidad de exportación en desarrollo', 'info')}>
                            <Download size={18} />
                            Exportar
                        </button>
                        <Link className="inline-flex items-center gap-2 bg-[#D91E18] hover:bg-[#b91c1b] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold active:scale-95"
                            href="/admin/eventos/nuevo">
                            <Plus size={20} />
                            Nuevo Evento
                        </Link>
                    </div>
                </div>

                {/* ========== KPI CARDS ========== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* KPI: Total Eventos */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eventos</span>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Calendar size={16} className="text-[#1E3A8A]" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{kpiTotal}</p>
                        <p className="text-xs text-slate-400 mt-1">Total programados</p>
                    </div>

                    {/* KPI: Inscripciones */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inscripciones</span>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Users size={16} className="text-green-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{kpiInscripciones}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {/* Dummy indicator */}
                            <span className="text-xs text-green-500 font-medium">+3 esta semana</span>
                        </div>
                    </div>

                    {/* KPI: Próximo Evento */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Próximo</span>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Calendar size={16} className="text-amber-600" />
                            </div>
                        </div>
                        {nextEvent ? (
                            <>
                                <p className="text-lg font-bold text-[#1E3A8A] leading-tight">
                                    {new Date(nextEvent.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-slate-400 mt-1 truncate" title={nextEvent.titulo}>{nextEvent.titulo}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-lg font-bold text-slate-300 leading-tight">--</p>
                                <p className="text-xs text-slate-400 mt-1">Sin eventos futuros</p>
                            </>
                        )}
                    </div>

                    {/* KPI: Modalidades Activas */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modalidades</span>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <ClipboardList size={16} className="text-purple-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[#1E3A8A]">{kpiModalidadesCount}</p>
                        <p className="text-xs text-slate-400 mt-1">Tipos utilizados</p>
                    </div>
                </div>

                {/* ========== CARDS: INSCRIPCIONES + CONFIGURACIÓN ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <Link className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-5 hover:border-blue-200"
                        href="/admin/inscripciones">
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={32} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1E3A8A] text-xl">Inscripciones</h3>
                            <p className="text-slate-400 text-sm mt-1">Ver lista de tiradores</p>
                        </div>
                        {/* Badge con contador */}
                        <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{kpiInscripciones}</span>
                    </Link>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-2">
                        <h3 className="font-bold text-[#1E3A8A] text-xl mb-6 flex items-center gap-3">
                            <Settings size={22} className="text-slate-400" strokeWidth={1.5} />
                            Configuración
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            <Link className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9FBFF] hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm hover:border-gray-300"
                                href="/admin/modalidades">
                                <ClipboardList size={18} strokeWidth={1.5} />
                                Modalidades
                            </Link>
                            <Link className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9FBFF] hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm hover:border-gray-300"
                                href="/admin/tipos-evento">
                                <Filter size={18} strokeWidth={1.5} />
                                Tipos
                            </Link>
                            <Link className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9FBFF] hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm hover:border-gray-300"
                                href="/admin/reglamentos">
                                <BookOpen size={18} strokeWidth={1.5} />
                                Reglamentos
                            </Link>
                            <Link className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9FBFF] hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors font-medium text-sm hover:border-gray-300"
                                href="/admin/categorias">
                                <ClipboardList size={18} strokeWidth={1.5} />
                                Categorías
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ========== TABLA DE EVENTOS ========== */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Header de tabla con búsqueda + Filtros */}
                    <div className="p-6 border-b border-slate-200 bg-[#F9FBFF]/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                                    <Calendar size={22} className="text-[#1E3A8A]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1E3A8A] text-lg">Eventos Programados</h3>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mt-1">
                                        {eventos.length} total
                                    </span>
                                </div>
                            </div>
                            <div className="relative w-full sm:w-auto group">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#1E3A8A] transition-colors z-10" />
                                <input placeholder="Buscar eventos..."
                                    className="pl-10 pr-4 py-2.5 w-full sm:w-72 rounded-lg border border-slate-200 bg-white shadow-sm focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] text-sm transition-all outline-none"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                        </div>

                        {/* Filtros avanzados */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Filtros:</span>

                            {/* Filtro por estado */}
                            <select
                                value={filterEstado}
                                onChange={(e) => setFilterEstado(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 font-medium focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none cursor-pointer"
                            >
                                <option value="">Estado (Todos)</option>
                                <option value="activo">🟢 Activo</option>
                                <option value="finalizado">⚫ Finalizado</option>
                            </select>

                            {/* Filtro por modalidad */}
                            <select
                                value={filterModalidad}
                                onChange={(e) => setFilterModalidad(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 font-medium focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none cursor-pointer"
                            >
                                <option value="">Modalidad (Todas)</option>
                                {uniqueModalidades.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>

                            {/* Filtro por tipo */}
                            <select
                                value={filterTipo}
                                onChange={(e) => setFilterTipo(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-600 font-medium focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none cursor-pointer"
                            >
                                <option value="">Tipo (Todos)</option>
                                {uniqueTipos.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            {/* Botón limpiar filtros */}
                            {(filterEstado || filterModalidad || filterTipo || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterEstado('');
                                        setFilterModalidad('');
                                        setFilterTipo('');
                                    }}
                                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-[#D91E18] font-medium transition-colors flex items-center gap-1"
                                    title="Limpiar filtros"
                                >
                                    <Trash2 size={12} />
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-[#F9FBFF] border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-4 w-12">
                                        <input type="checkbox" className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer" />
                                    </th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Fecha</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Título</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Estado</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Modalidad</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-center">Inscritos</th>
                                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedEventos.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                            No se encontraron eventos con estos filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEventos.map(evento => {
                                        const fecha = new Date(evento.fecha + 'T12:00:00');
                                        const status = getEventStatus(evento.fecha);
                                        const isNext = nextEvent?.id === evento.id;

                                        return (
                                            <tr key={evento.id} className="hover:bg-[#F9FBFF] transition-colors group">
                                                <td className="px-4 py-5">
                                                    <input type="checkbox" className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer" />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-700 font-medium">
                                                            {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {isNext && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                                                Próximamente
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Link href={`/admin/eventos/${evento.id}/editar`} className="font-semibold text-[#1E3A8A] text-base hover:underline">
                                                        {evento.titulo}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {status === 'activo' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                            Finalizado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border"
                                                        style={{
                                                            backgroundColor: `${evento.modalidades?.color}10`,
                                                            color: evento.modalidades?.color,
                                                            borderColor: `${evento.modalidades?.color}20`
                                                        }}>
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evento.modalidades?.color }}></span>
                                                        {evento.modalidades?.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold border"
                                                        style={{
                                                            backgroundColor: `${evento.tipos_evento?.color || '#94A3B8'}10`,
                                                            color: evento.tipos_evento?.color || '#94A3B8',
                                                            borderColor: `${evento.tipos_evento?.color || '#94A3B8'}20`
                                                        }}>
                                                        {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#1E3A8A] font-bold text-xs border border-blue-100">
                                                        {evento.inscripciones?.[0]?.count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/eventos/${evento.id}/editar`} className="p-2 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(evento.id)}
                                                            className="p-2 text-slate-400 hover:text-[#D91E18] hover:bg-red-50 rounded-lg transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-[#F9FBFF]/50">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredEventos.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
