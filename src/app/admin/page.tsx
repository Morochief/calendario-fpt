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
    Home,
    ChevronDown
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
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-main mx-auto w-full animate-page-enter">

                {/* ========== BREADCRUMB ========== */}
                <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center flex-wrap gap-2 text-sm text-text-muted">
                        <li className="flex items-center gap-2">
                            <Link className="flex items-center gap-1 hover:text-cop-blue transition-colors" href="/">
                                <Home size={14} />
                                <span>Inicio</span>
                            </Link>
                            <ChevronRight size={14} className="text-slate-300" />
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-medium text-text-elite">
                                <Settings size={14} />
                                <span>Admin</span>
                            </span>
                        </li>
                    </ol>
                </nav>

                {/* ========== HEADER CON ACCIONES ========== */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 my-10">
                    <div>
                        <h1 className="text-4xl font-bold text-text-elite tracking-tight">Panel de Administración</h1>
                        <p className="text-text-secondary mt-2 text-lg font-light">Gestiona eventos, inscripciones y configuraciones del sistema.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Botón exportar (Placeholder) */}
                        <button className="btn btn-secondary shadow-elite-sm hover:shadow-elite-md active:scale-95"
                            title="Exportar eventos" onClick={() => showToast('Funcionalidad de exportación en desarrollo', 'info')}>
                            <Download size={18} />
                            Exportar
                        </button>
                        <Link className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95"
                            href="/admin/eventos/nuevo">
                            <Plus size={20} />
                            Nuevo Evento
                        </Link>
                    </div>
                </div>

                {/* ========== KPI CARDS ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 stagger-children">
                    {/* KPI: Total Eventos */}
                    <div className="admin-stat-card group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="admin-stat-label">Eventos</span>
                            <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={20} className="text-cop-blue" />
                            </div>
                        </div>
                        <p className="admin-stat-value">{kpiTotal}</p>
                        <p className="text-xs text-text-muted mt-2 font-medium">Total programados</p>
                    </div>

                    {/* KPI: Inscripciones */}
                    <div className="admin-stat-card group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="admin-stat-label">Inscripciones</span>
                            <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Users size={20} className="text-status-success" />
                            </div>
                        </div>
                        <p className="admin-stat-value">{kpiInscripciones}</p>
                        <div className="flex items-center gap-1 mt-2">
                            {/* Dummy indicator */}
                            <span className="text-xs text-status-success font-bold bg-green-50 px-2 py-0.5 rounded-full">+3 esta semana</span>
                        </div>
                    </div>

                    {/* KPI: Próximo Evento */}
                    <div className="admin-stat-card group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="admin-stat-label">Próximo</span>
                            <div className="p-3 bg-amber-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Calendar size={20} className="text-status-warning" />
                            </div>
                        </div>
                        {nextEvent ? (
                            <div className="mt-auto">
                                <p className="text-xl font-bold text-text-elite leading-tight mb-1">
                                    {new Date(nextEvent.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-text-secondary truncate font-medium" title={nextEvent.titulo}>{nextEvent.titulo}</p>
                            </div>
                        ) : (
                            <div className="mt-auto">
                                <p className="text-xl font-bold text-slate-300 leading-tight">--</p>
                                <p className="text-xs text-text-muted mt-1">Sin eventos futuros</p>
                            </div>
                        )}
                    </div>

                    {/* KPI: Modalidades Activas */}
                    <div className="admin-stat-card group">
                        <div className="flex items-center justify-between mb-4">
                            <span className="admin-stat-label">Modalidades</span>
                            <div className="p-3 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <ClipboardList size={20} className="text-purple-600" />
                            </div>
                        </div>
                        <p className="admin-stat-value">{kpiModalidadesCount}</p>
                        <p className="text-xs text-text-muted mt-2 font-medium">Tipos utilizados</p>
                    </div>
                </div>

                {/* ========== CARDS: INSCRIPCIONES + CONFIGURACIÓN ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <Link className="group bg-surface p-6 rounded-[16px] border border-[rgba(30,58,138,0.08)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_25px_-5px_rgba(30,58,138,0.08),0_10px_10px_-5px_rgba(30,58,138,0.03)] hover:border-green-500/50 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center gap-6 relative overflow-hidden h-full"
                        style={{ borderRadius: 'var(--radius-lg)' }}
                        href="/admin/inscripciones">
                        {/* Hover Bar Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-8 -translate-y-8 pointer-events-none">
                            <Users size={150} className="text-green-600" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 text-green-600 rounded-xl group-hover:scale-110 transition-transform shadow-sm relative z-10 group-hover:shadow-green-500/20">
                            <Users size={32} strokeWidth={2} />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-text-elite text-xl group-hover:text-green-700 transition-colors">Inscripciones</h3>
                            <p className="text-text-muted text-sm mt-1 font-medium group-hover:text-green-600/80 transition-colors">Ver lista de tiradores</p>
                        </div>
                        {/* Badge con contador */}
                        <span className="ml-auto bg-white border border-green-200 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg shadow-green-900/5">{kpiInscripciones}</span>
                    </Link>

                    <div className="group bg-surface p-6 rounded-[16px] border border-[rgba(30,58,138,0.08)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_25px_-5px_rgba(30,58,138,0.08),0_10px_10px_-5px_rgba(30,58,138,0.03)] hover:border-cop-blue/30 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden h-full"
                        style={{ borderRadius: 'var(--radius-lg)' }}>
                        {/* Hover Bar Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

                        <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Settings size={150} />
                        </div>
                        <h3 className="font-bold text-text-elite text-xl mb-6 flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors duration-300">
                                <Settings size={20} className="text-text-secondary group-hover:text-cop-blue transition-colors duration-300" strokeWidth={2} />
                            </div>
                            Configuración
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 w-full">
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-text-secondary rounded-xl border border-slate-200 transition-all duration-200 font-semibold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/modalidades">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <ClipboardList size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="group-hover/link:text-cop-blue transition-colors text-center">Modalidades</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-text-secondary rounded-xl border border-slate-200 transition-all duration-200 font-semibold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/tipos-evento">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <Filter size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="group-hover/link:text-cop-blue transition-colors text-center">Tipos de Evento</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-text-secondary rounded-xl border border-slate-200 transition-all duration-200 font-semibold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/reglamentos">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <BookOpen size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="group-hover/link:text-cop-blue transition-colors text-center">Reglamentos</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-text-secondary rounded-xl border border-slate-200 transition-all duration-200 font-semibold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/categorias">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <ClipboardList size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="group-hover/link:text-cop-blue transition-colors text-center">Categorías</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ========== TABLA DE EVENTOS ========== */}
                {/* ========== TABLA DE EVENTOS ========== */}
                <div className="bg-surface rounded-[16px] border border-[rgba(30,58,138,0.08)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] relative overflow-hidden animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>

                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue via-blue-500 to-cop-blue opacity-80"></div>

                    {/* Header de tabla con búsqueda + Filtros */}
                    <div className="p-6 border-b border-border-elite bg-white/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-300">
                                    <Calendar size={24} className="text-slate-400 group-hover:text-cop-blue transition-colors duration-300" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-elite text-xl tracking-tight flex items-center gap-2">
                                        Eventos Programados
                                    </h3>
                                    <span className="inline-flex items-center gap-1.5 mt-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cop-blue opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cop-blue"></span>
                                        </span>
                                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{eventos.length} total</span>
                                    </span>
                                </div>
                            </div>
                            <div className="relative w-full sm:w-80 group/search flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-cop-blue focus-within:ring-4 focus-within:ring-cop-blue/10 hover:border-cop-blue/50 hover:shadow-md transition-all duration-300">
                                <div className="pl-4 pr-3 text-slate-400 group-focus-within/search:text-cop-blue transition-colors duration-300 pointer-events-none">
                                    <Search size={20} />
                                </div>
                                <input placeholder="Buscar eventos..."
                                    id="search-events"
                                    name="search"
                                    className="w-full py-3 pr-4 bg-transparent border-none outline-none text-sm font-medium text-text-elite placeholder:text-slate-400 focus:ring-0"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtros avanzados */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                <Filter size={12} />
                                Filtros:
                            </span>

                            {/* Filtro por estado */}
                            <div className="relative group/select">
                                <select
                                    className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-text-secondary focus:outline-none focus:border-cop-blue focus:ring-2 focus:ring-cop-blue/10 hover:border-cop-blue/50 hover:shadow-md transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                >
                                    <option value="">Estado (Todos)</option>
                                    <option value="activo">🟢 Activo</option>
                                    <option value="finalizado">⚫ Finalizado</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:text-cop-blue transition-colors pointer-events-none" size={14} />
                            </div>

                            {/* Filtro por modalidad */}
                            <div className="relative group/select">
                                <select
                                    className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-text-secondary focus:outline-none focus:border-cop-blue focus:ring-2 focus:ring-cop-blue/10 hover:border-cop-blue/50 hover:shadow-md transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
                                    value={filterModalidad}
                                    onChange={(e) => setFilterModalidad(e.target.value)}
                                >
                                    <option value="">Modalidad (Todas)</option>
                                    {uniqueModalidades.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:text-cop-blue transition-colors pointer-events-none" size={14} />
                            </div>

                            {/* Filtro por tipo */}
                            <div className="relative group/select">
                                <select
                                    className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-text-secondary focus:outline-none focus:border-cop-blue focus:ring-2 focus:ring-cop-blue/10 hover:border-cop-blue/50 hover:shadow-md transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
                                    value={filterTipo}
                                    onChange={(e) => setFilterTipo(e.target.value)}
                                >
                                    <option value="">Tipo (Todos)</option>
                                    {uniqueTipos.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover/select:text-cop-blue transition-colors pointer-events-none" size={14} />
                            </div>

                            {/* Botón limpiar filtros */}
                            {(filterEstado || filterModalidad || filterTipo || searchTerm) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterEstado('');
                                        setFilterModalidad('');
                                        setFilterTipo('');
                                    }}
                                    className="px-4 py-2 text-xs text-fpt-red hover:bg-red-50 font-bold transition-colors flex items-center gap-1.5 rounded-lg ml-auto"
                                    title="Limpiar filtros"
                                >
                                    <Trash2 size={12} />
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto p-4 bg-slate-50/30">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 w-12 rounded-l-lg">
                                        <input type="checkbox" className="admin-checkbox" />
                                    </th>
                                    <th className="sortable">Fecha</th>
                                    <th className="sortable">Título</th>
                                    <th>Estado</th>
                                    <th>Modalidad</th>
                                    <th>Tipo</th>
                                    <th className="text-center">Inscritos</th>
                                    <th className="text-right rounded-r-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {paginatedEventos.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-text-muted">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="p-4 bg-slate-100 rounded-full">
                                                    <Search size={24} className="text-slate-400" />
                                                </div>
                                                <p className="font-medium">No se encontraron eventos con estos filtros.</p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setFilterEstado('');
                                                        setFilterModalidad('');
                                                        setFilterTipo('');
                                                    }}
                                                    className="text-sm text-cop-blue hover:underline font-semibold"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedEventos.map(evento => {
                                        const fecha = new Date(evento.fecha + 'T12:00:00');
                                        const status = getEventStatus(evento.fecha);
                                        const isNext = nextEvent?.id === evento.id;

                                        return (
                                            <tr key={evento.id} className="group">
                                                <td className="px-6 py-5">
                                                    <input type="checkbox" className="admin-checkbox" />
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-text-elite font-bold text-sm">
                                                            {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        {isNext && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 mt-1 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                Próximo
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Link href={`/admin/eventos/${evento.id}/editar`} className="font-bold text-text-elite text-base hover:text-cop-blue transition-colors line-clamp-1 block max-w-[200px]" title={evento.titulo}>
                                                        {evento.titulo}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {status === 'activo' ? (
                                                        <span className="status-badge status-active shadow-sm border border-green-200/50">
                                                            <span className="status-dot"></span>
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge status-closed shadow-sm border border-slate-200/50">
                                                            <span className="status-dot"></span>
                                                            Finalizado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm"
                                                        style={{
                                                            backgroundColor: 'white',
                                                            color: evento.modalidades?.color,
                                                            borderColor: `${evento.modalidades?.color}30`
                                                        }}>
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evento.modalidades?.color }}></span>
                                                        {evento.modalidades?.nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex px-3 py-1 rounded-md text-xs font-semibold border bg-slate-50 text-slate-600 border-slate-200">
                                                        {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border shadow-sm transition-transform group-hover:scale-110 ${(evento.inscripciones?.[0]?.count || 0) > 0
                                                        ? 'bg-blue-50 text-cop-blue border-blue-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        {evento.inscripciones?.[0]?.count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="admin-actions justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/eventos/${evento.id}/editar`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border-elite text-text-muted hover:text-cop-blue hover:border-cop-blue hover:shadow-md transition-all active:scale-95" title="Editar">
                                                            <Edit size={16} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(evento.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border-elite text-text-muted hover:text-fpt-red hover:border-fpt-red hover:shadow-md transition-all active:scale-95"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
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
                    <div className="px-6 py-4 border-t border-border-elite bg-white">
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
