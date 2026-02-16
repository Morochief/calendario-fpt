'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdminFilterDropdown from '@/components/AdminFilterDropdown';
import Pagination from '@/components/Pagination';
import { useToast } from '@/components/Toast';
import {
    Plus,
    Calendar,
    Users,
    FileText,
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
    ChevronDown,
    Activity,
    Tag,
    Building2
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

            const matchesModalidad = (filterModalidad && filterModalidad !== 'todas') ? evento.modalidades?.nombre === filterModalidad : true;

            const matchesTipo = (filterTipo && filterTipo !== 'todos') ? (evento.tipos_evento?.nombre === filterTipo || evento.tipo === filterTipo) : true;

            const status = getEventStatus(evento.fecha);
            const matchesEstado = (filterEstado && filterEstado !== 'todos') ? status === filterEstado : true;

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
                        <h1 className="text-4xl font-bold text-text-elite">Panel de Administración</h1>
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
                            <p className="text-text-muted text-sm mt-1 font-medium group-hover:text-green-600/80 transition-colors">Ver lista de inscripciones</p>
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
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10 w-full">
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
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-text-secondary rounded-xl border border-slate-200 transition-all duration-200 font-semibold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/clubes">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <Building2 size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="group-hover/link:text-cop-blue transition-colors text-center">Clubes</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ========== TABLA DE EVENTOS ========== */}
                {/* ========== TABLA DE EVENTOS ========== */}
                <div className="bg-surface rounded-[16px] border border-[rgba(30,58,138,0.08)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] relative animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>

                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue via-blue-500 to-cop-blue opacity-80" style={{ borderRadius: '16px 16px 0 0' }}></div>

                    {/* Header de tabla con búsqueda + Filtros */}
                    <div className="p-6 border-b border-border-elite bg-white/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-5">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-300">
                                    <Calendar size={24} className="text-slate-400 group-hover:text-cop-blue transition-colors duration-300" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-elite text-xl flex items-center gap-2">
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
                            <div className="relative w-full sm:w-80 group/search flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-cop-blue/60 focus-within:shadow-[0_0_0_4px_rgba(30,58,138,0.1)] hover:border-cop-blue/40 hover:shadow-md transition-all duration-300">
                                <div className="pl-4 pr-3 text-slate-400 group-focus-within/search:text-cop-blue transition-colors duration-300 pointer-events-none">
                                    <Search size={20} />
                                </div>
                                <input placeholder="Buscar eventos..."
                                    id="search-events"
                                    name="search"
                                    style={{ boxShadow: 'none', border: 'none', outline: 'none' }}
                                    className="w-full py-3 pr-4 bg-transparent !border-none !outline-none !shadow-none !ring-0 focus:!border-none focus:!outline-none focus:!ring-0 active:!outline-none text-sm font-medium text-text-elite placeholder:text-slate-400 appearance-none"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtros avanzados */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">

                            {/* Filtro por estado */}
                            <AdminFilterDropdown
                                label="Estado"
                                icon={Activity}
                                value={filterEstado}
                                onChange={setFilterEstado}
                                options={[
                                    { value: 'todos', label: 'Todos los estados' },
                                    { value: 'activo', label: 'Activos', color: '#22C55E' },
                                    { value: 'finalizado', label: 'Finalizados', color: '#64748B' },
                                    { value: 'cancelado', label: 'Cancelados', color: '#EF4444' }
                                ]}
                            />

                            {/* Filtro por modalidad */}
                            <AdminFilterDropdown
                                label="Modalidad"
                                icon={Filter}
                                value={filterModalidad}
                                onChange={setFilterModalidad}
                                options={[
                                    { value: 'todas', label: 'Todas las modalidades' },
                                    ...uniqueModalidades.filter(Boolean).map(m => ({
                                        value: m || '',
                                        label: m || '',
                                        // Match color if possible, hard to get from string array.
                                        // Ideally we need the full object but uniqueModalidades is string[].
                                        // For now no color dot is fine or generic blue.
                                        color: '#3B82F6'
                                    }))
                                ]}
                            />

                            {/* Filtro por tipo */}
                            <AdminFilterDropdown
                                label="Tipo"
                                icon={Tag}
                                value={filterTipo}
                                onChange={setFilterTipo}
                                options={[
                                    { value: 'todos', label: 'Todos los tipos' },
                                    ...uniqueTipos.filter(Boolean).map(t => ({
                                        value: t || '',
                                        label: t || '',
                                        color: '#8B5CF6'
                                    }))
                                ]}
                            />

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

                    {/* Grid Table — mathematically aligned columns */}
                    <div style={{ padding: '1rem', background: 'rgba(248, 250, 252, 0.3)', overflowX: 'auto' }}>
                        {/* Shared grid template for perfect column sync */}
                        {(() => {
                            const gridCols = '48px 130px 1.5fr 120px 180px 110px 80px 100px';
                            return (
                                <>
                                    {/* Header Row */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: gridCols,
                                        alignItems: 'center',
                                        padding: '0 0.25rem',
                                        marginBottom: '0.25rem',
                                    }}>
                                        <div style={{ paddingLeft: '0.75rem' }}>
                                            <input type="checkbox" className="admin-checkbox" />
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                        }}>Fecha</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                        }}>Título</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                            textAlign: 'center',
                                        }}>Estado</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                            textAlign: 'center',
                                        }}>Modalidad</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                            textAlign: 'center',
                                        }}>Tipo</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                            textAlign: 'center',
                                        }}>Inscritos</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            color: '#94A3B8', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', padding: '0.75rem 0.5rem',
                                            textAlign: 'right',
                                        }}>Acciones</div>
                                    </div>

                                    {/* Data Rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {paginatedEventos.length === 0 ? (
                                            <div style={{
                                                padding: '4rem 2rem', textAlign: 'center',
                                                color: '#94A3B8', background: 'white',
                                                borderRadius: '12px', border: '1px solid rgba(30,58,138,0.06)',
                                            }}>
                                                <div style={{
                                                    width: '56px', height: '56px', background: '#F1F5F9',
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', margin: '0 auto 1rem',
                                                }}>
                                                    <Search size={24} style={{ color: '#94A3B8' }} />
                                                </div>
                                                <p style={{ fontWeight: 600, color: '#64748B', marginBottom: '0.5rem' }}>
                                                    No se encontraron eventos con estos filtros.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setFilterEstado('');
                                                        setFilterModalidad('');
                                                        setFilterTipo('');
                                                    }}
                                                    style={{
                                                        fontSize: '0.875rem', color: '#1E3A8A', fontWeight: 600,
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        textDecoration: 'underline',
                                                    }}
                                                >
                                                    Limpiar filtros
                                                </button>
                                            </div>
                                        ) : (
                                            paginatedEventos.map(evento => {
                                                const fecha = new Date(evento.fecha + 'T12:00:00');
                                                const status = getEventStatus(evento.fecha);
                                                const isNext = nextEvent?.id === evento.id;

                                                return (
                                                    <div
                                                        key={evento.id}
                                                        className="group"
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: gridCols,
                                                            alignItems: 'center',
                                                            background: 'white',
                                                            borderRadius: '12px',
                                                            border: '1px solid rgba(30, 58, 138, 0.06)',
                                                            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.04)',
                                                            transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                            position: 'relative',
                                                            cursor: 'default',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            const el = e.currentTarget;
                                                            el.style.boxShadow = '0 12px 32px rgba(30, 58, 138, 0.12), 0 4px 8px rgba(30, 58, 138, 0.06)';
                                                            el.style.transform = 'translateY(-2px) scale(1.005)';
                                                            el.style.borderColor = 'rgba(30, 58, 138, 0.12)';
                                                            el.style.zIndex = '5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            const el = e.currentTarget;
                                                            el.style.boxShadow = '0 2px 6px rgba(30, 58, 138, 0.04)';
                                                            el.style.transform = 'translateY(0) scale(1)';
                                                            el.style.borderColor = 'rgba(30, 58, 138, 0.06)';
                                                            el.style.zIndex = '0';
                                                        }}
                                                    >
                                                        {/* Checkbox */}
                                                        <div style={{ paddingLeft: '0.75rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
                                                            <input type="checkbox" className="admin-checkbox" />
                                                        </div>

                                                        {/* Fecha */}
                                                        <div style={{ padding: '1rem 0.5rem' }}>
                                                            <span style={{ fontWeight: 700, color: '#1E3A8A', fontSize: '0.8125rem' }}>
                                                                {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            {isNext && (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                                    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                                                                    letterSpacing: '0.06em', color: '#D97706',
                                                                    marginTop: '4px', background: '#FFFBEB',
                                                                    padding: '2px 8px', borderRadius: '100px',
                                                                }}>
                                                                    <span style={{
                                                                        width: '5px', height: '5px', borderRadius: '50%',
                                                                        background: '#F59E0B',
                                                                    }} />
                                                                    Próximo
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Título */}
                                                        <div style={{ padding: '1rem 0.5rem', overflow: 'hidden' }}>
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}/editar`}
                                                                style={{
                                                                    fontWeight: 700, color: '#1E3A8A', fontSize: '0.9375rem',
                                                                    textDecoration: 'none', display: 'block',
                                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                    transition: 'color 0.2s',
                                                                }}
                                                                title={evento.titulo}
                                                                onMouseEnter={(e) => { e.currentTarget.style.color = '#2D4BA6'; }}
                                                                onMouseLeave={(e) => { e.currentTarget.style.color = '#1E3A8A'; }}
                                                            >
                                                                {evento.titulo}
                                                            </Link>
                                                        </div>

                                                        {/* Estado */}
                                                        <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                                            {status === 'activo' ? (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                    fontSize: '0.6875rem', fontWeight: 700,
                                                                    padding: '4px 10px', borderRadius: '100px',
                                                                    color: '#16A34A', background: '#F0FDF4',
                                                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                }}>
                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                                                                    ACTIVO
                                                                </span>
                                                            ) : (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                    fontSize: '0.6875rem', fontWeight: 700,
                                                                    padding: '4px 10px', borderRadius: '100px',
                                                                    color: '#64748B', background: '#F8FAFC',
                                                                    border: '1px solid rgba(100, 116, 139, 0.2)',
                                                                }}>
                                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
                                                                    Finalizado
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Modalidad */}
                                                        <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                                fontSize: '0.6875rem', fontWeight: 700,
                                                                padding: '4px 10px', borderRadius: '100px',
                                                                color: evento.modalidades?.color || '#1E3A8A',
                                                                background: 'white',
                                                                border: `1px solid ${(evento.modalidades?.color || '#1E3A8A')}30`,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.04em',
                                                            }}>
                                                                <span style={{
                                                                    width: '7px', height: '7px', borderRadius: '50%',
                                                                    background: evento.modalidades?.color || '#1E3A8A',
                                                                }} />
                                                                {evento.modalidades?.nombre}
                                                            </span>
                                                        </div>

                                                        {/* Tipo */}
                                                        <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                display: 'inline-flex',
                                                                fontSize: '0.75rem', fontWeight: 600,
                                                                padding: '3px 10px', borderRadius: '6px',
                                                                color: '#64748B', background: '#F8FAFC',
                                                                border: '1px solid #E2E8F0',
                                                            }}>
                                                                {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                            </span>
                                                        </div>

                                                        {/* Inscritos */}
                                                        <div style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                fontWeight: 700, fontSize: '0.75rem',
                                                                color: (evento.inscripciones?.[0]?.count || 0) > 0 ? '#1E3A8A' : '#94A3B8',
                                                                background: (evento.inscripciones?.[0]?.count || 0) > 0 ? '#EFF6FF' : '#F8FAFC',
                                                                border: `1px solid ${(evento.inscripciones?.[0]?.count || 0) > 0 ? '#BFDBFE' : '#E2E8F0'}`,
                                                            }}>
                                                                {evento.inscripciones?.[0]?.count || 0}
                                                            </span>
                                                        </div>

                                                        {/* Acciones */}
                                                        <div style={{ padding: '1rem 0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}/editar`}
                                                                title="Editar"
                                                                style={{
                                                                    width: '32px', height: '32px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    borderRadius: '8px', background: 'white',
                                                                    border: '1.5px solid rgba(30,58,138,0.12)',
                                                                    color: '#94A3B8', textDecoration: 'none',
                                                                    transition: 'all 0.2s',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.color = '#1E3A8A';
                                                                    e.currentTarget.style.borderColor = '#1E3A8A';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,138,0.12)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.color = '#94A3B8';
                                                                    e.currentTarget.style.borderColor = 'rgba(30,58,138,0.12)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <Edit size={15} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(evento.id)}
                                                                title="Eliminar"
                                                                style={{
                                                                    width: '32px', height: '32px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    borderRadius: '8px', background: 'white',
                                                                    border: '1.5px solid rgba(30,58,138,0.12)',
                                                                    color: '#94A3B8', cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.color = '#D91E18';
                                                                    e.currentTarget.style.borderColor = '#D91E18';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(217,30,24,0.12)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.color = '#94A3B8';
                                                                    e.currentTarget.style.borderColor = 'rgba(30,58,138,0.12)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            );
                        })()}
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
