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
import StatCard from '@/components/ui/StatCard';
import EliteButton from '@/components/ui/EliteButton';
import { cn } from '@/lib/utils';

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

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Check if user is admin (simplified check for now)
        const allowedAdmins = ['admin@fpdt.org.py', 'admin@fpt.com'];
        if (!user.email || !allowedAdmins.includes(user.email)) {
            router.push('/');
            return;
        }

        loadEventos();
    }

    useEffect(() => {
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadEventos() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('eventos')
            .select(`
                *,
                modalidades (*),
                tipos_evento (*),
                clubes (*),
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

                {/* ========== WATERMARK BACKGROUND ========== */}
                <div className="fixed bottom-0 right-0 pointer-events-none z-0 overflow-hidden opacity-[0.05] translate-x-1/4 translate-y-1/4 rotate-12">
                    <img
                        src="/LOGO_FPDT-removebg-preview.svg"
                        alt="FPDT Watermark"
                        className="w-[1000px] h-[1000px] object-contain grayscale"
                    />
                </div>

                {/* ========== HEADER CON ACCIONES ========== */}
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 my-10 animate-fade-in">
                    <div>
                        <h1 className="text-4xl font-black text-cop-blue tracking-tight">Panel de Administración</h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium">
                            Gestiona eventos, inscripciones y configuraciones del sistema.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Botón exportar */}
                        <button
                            onClick={() => showToast('Funcionalidad de exportación en desarrollo', 'info')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-cop-blue font-bold text-sm transition-all duration-200 hover:border-cop-blue hover:bg-blue-50 hover:shadow-md active:scale-95"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span>Exportar</span>
                        </button>

                        <Link
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 bg-fpt-red text-white hover:bg-cop-blue shadow-md shadow-red-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 active:translate-y-0"
                            href="/admin/eventos/nuevo"
                        >
                            <Plus size={20} className="mr-2" strokeWidth={2.5} />
                            Nuevo Evento
                        </Link>
                    </div>
                </div>

                {/* ========== KPI CARDS ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 stagger-children">
                    <StatCard
                        label="Eventos"
                        value={kpiTotal}
                        description="Total programados"
                        icon={Calendar}
                        iconColor="text-cop-blue"
                        iconBg="bg-blue-50"
                    />
                    <StatCard
                        label="Inscripciones"
                        value={kpiInscripciones}
                        trend="+3 esta semana"
                        icon={Users}
                        iconColor="text-fpt-red"
                        iconBg="bg-red-50"
                    />
                    <StatCard
                        label="Próximo"
                        value={nextEvent ? new Date(nextEvent.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : "--"}
                        description={nextEvent ? nextEvent.titulo : "Sin eventos futuros"}
                        icon={Calendar}
                        iconColor="text-cop-blue"
                        iconBg="bg-blue-50"
                    />
                    <StatCard
                        label="Modalidades"
                        value={kpiModalidadesCount}
                        description="Tipos utilizados"
                        icon={ClipboardList}
                        iconColor="text-cop-blue"
                        iconBg="bg-blue-50"
                    />
                </div>

                {/* ========== CARDS: INSCRIPCIONES + CONFIGURACIÓN ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 stagger-children" style={{ animationDelay: '0.1s' }}>
                    <Link className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center gap-6 relative overflow-hidden h-full"
                        href="/admin/inscripciones">
                        {/* Hover Bar Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fpt-red to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-8 -translate-y-8 pointer-events-none">
                            <Users size={150} className="text-fpt-red" />
                        </div>
                        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 text-fpt-red rounded-xl group-hover:scale-110 transition-transform shadow-sm relative z-10 group-hover:shadow-red-500/20">
                            <Users size={32} strokeWidth={2.5} />
                        </div>
                        <div className="z-10">
                            <h3 className="font-bold text-cop-blue text-xl group-hover:text-fpt-red transition-colors">Inscripciones</h3>
                            <p className="text-slate-500 text-sm mt-1 font-medium group-hover:text-slate-600 transition-colors">Ver lista de inscripciones</p>
                        </div>
                        {/* Badge con contador */}
                        <span className="ml-auto bg-white border border-red-200 text-fpt-red text-xs font-black px-3 py-1 rounded-full shadow-sm z-10 group-hover:bg-fpt-red group-hover:text-white group-hover:border-fpt-red transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-lg shadow-red-900/5">{kpiInscripciones}</span>
                    </Link>

                    <div className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 ease-out col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden h-full">

                        {/* Hover Bar Effect */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left"></div>

                        <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <Settings size={150} className="text-cop-blue" />
                        </div>
                        <h3 className="font-bold text-cop-blue text-xl mb-6 flex items-center gap-3 relative z-10">
                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                                <Settings size={20} className="text-cop-blue" strokeWidth={2.5} />
                            </div>
                            Configuración
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10 w-full">
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-cop-blue hover:text-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/modalidades">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <ClipboardList size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-cop-blue">Modalidades</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-fpt-red hover:text-fpt-red hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/tipos-evento">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-red-50 transition-colors">
                                    <Filter size={24} className="text-slate-400 group-hover/link:text-fpt-red transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-fpt-red">Tipos</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-cop-blue hover:text-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/reglamentos">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <BookOpen size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-cop-blue">Reglamentos</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-fpt-red hover:text-fpt-red hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/categorias">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-red-50 transition-colors">
                                    <ClipboardList size={24} className="text-slate-400 group-hover/link:text-fpt-red transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-fpt-red">Categorías</span>
                            </Link>
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-cop-blue hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full"
                                href="/admin/clubes">
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-blue-50 transition-colors">
                                    <Building2 size={24} className="text-slate-400 group-hover/link:text-cop-blue transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-cop-blue">Clubes</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ========== TABLA DE EVENTOS ========== */}
                {/* ========== TABLA DE EVENTOS ========== */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl shadow-slate-200/40 relative animate-fade-in-up group overflow-hidden" style={{ animationDelay: '0.2s' }}>

                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue via-blue-500 to-cop-blue opacity-80 z-20"></div>

                    {/* Header de tabla con búsqueda + Filtros */}
                    <div className="p-8 border-b border-slate-100 bg-white/40">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500">
                                    <Calendar size={28} className="text-cop-blue" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-2xl tracking-tight">
                                        Eventos Programados
                                    </h3>
                                    <div className="flex items-center gap-2.5 mt-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cop-blue opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cop-blue"></span>
                                        </span>
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{eventos.length} total</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-full lg:w-96 group/search flex items-center bg-white/80 border border-slate-200 rounded-2xl shadow-sm focus-within:border-cop-blue focus-within:ring-4 focus-within:ring-blue-900/5 hover:border-slate-300 hover:shadow-md transition-all duration-300">
                                <div className="pl-5 pr-3 text-slate-400 group-focus-within/search:text-cop-blue transition-colors duration-300 pointer-events-none">
                                    <Search size={22} />
                                </div>
                                <input placeholder="Buscar eventos por título o tipo..."
                                    id="search-events"
                                    name="search"
                                    className="w-full py-4 pr-5 bg-transparent border-none outline-none shadow-none ring-0 focus:ring-0 text-base font-medium text-slate-700 placeholder:text-slate-400"
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
                    <div className="p-6 bg-slate-50/50 overflow-x-auto min-h-[400px]">
                        {/* Shared grid template for perfect column sync */}
                        {(() => {
                            const gridCols = '48px 140px 1.5fr 120px 180px 110px 80px 100px';
                            return (
                                <>
                                    {/* Header Row */}
                                    <div
                                        style={{ gridTemplateColumns: gridCols }}
                                        className="grid items-center px-4 mb-3"
                                    >
                                        <div className="flex items-center">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cop-blue focus:ring-blue-500/20 transition-all cursor-pointer" />
                                        </div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2">Fecha</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2">Título del Evento</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Estado</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Modalidad</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Tipo</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Inscritos</div>
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-right">Acciones</div>
                                    </div>

                                    {/* Data Rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="stagger-children">
                                        {paginatedEventos.length === 0 ? (
                                            <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                    <Search size={32} className="text-slate-300" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-700 mb-2">No se encontraron eventos</h4>
                                                <p className="text-slate-400 max-w-xs mx-auto mb-6">
                                                    Prueba con otros términos de búsqueda o ajusta los filtros.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setFilterEstado('');
                                                        setFilterModalidad('');
                                                        setFilterTipo('');
                                                    }}
                                                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-cop-blue font-bold text-sm hover:border-cop-blue hover:bg-blue-50 transition-all shadow-sm"
                                                >
                                                    Limpiar todos los filtros
                                                </button>
                                            </div>
                                        ) : (
                                            paginatedEventos.map((evento, idx) => {
                                                const fecha = new Date(evento.fecha + 'T12:00:00');
                                                const status = getEventStatus(evento.fecha);
                                                const isNext = nextEvent?.id === evento.id;

                                                return (
                                                    <div
                                                        key={evento.id}
                                                        className="group relative grid items-center bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:border-cop-blue/20 hover:-translate-y-0.5 hover:z-10 animate-fade-in"
                                                        style={{
                                                            gridTemplateColumns: gridCols,
                                                            animationDelay: `${idx * 0.03}s`
                                                        }}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="px-4 py-5">
                                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cop-blue focus:ring-blue-500/20 transition-all cursor-pointer" />
                                                        </div>

                                                        {/* Fecha */}
                                                        <div className="p-2">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800 text-sm">
                                                                    {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                                {isNext && (
                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-600">Próximo</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Título */}
                                                        <div className="p-2 overflow-hidden">
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}/editar`}
                                                                className="font-bold text-slate-800 text-base block truncate transition-all group-hover:text-cop-blue"
                                                                title={evento.titulo}
                                                            >
                                                                {evento.titulo}
                                                            </Link>
                                                            <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-slate-500 transition-colors uppercase tracking-widest font-semibold">ID: {evento.id.substring(0, 8)}</p>
                                                        </div>

                                                        {/* Estado */}
                                                        <div className="p-2 text-center">
                                                            {status === 'activo' ? (
                                                                <span className="inline-flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full text-emerald-600 bg-emerald-50/50 border border-emerald-100 uppercase tracking-wider shadow-sm">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    Activo
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full text-slate-400 bg-slate-50 border border-slate-100 uppercase tracking-wider">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                                    Cerrado
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Modalidad */}
                                                        <div className="p-2 text-center">
                                                            <span className="inline-flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full border bg-white shadow-sm uppercase tracking-wider"
                                                                style={{
                                                                    color: evento.modalidades?.color || '#1E3A8A',
                                                                    borderColor: `${(evento.modalidades?.color || '#1E3A8A')}30`
                                                                }}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full"
                                                                    style={{ background: evento.modalidades?.color || '#1E3A8A' }}
                                                                />
                                                                {evento.modalidades?.nombre}
                                                            </span>
                                                        </div>

                                                        {/* Tipo */}
                                                        <div className="p-2 text-center">
                                                            <span className="inline-flex text-[10px] font-bold px-3 py-1.5 rounded-lg text-slate-500 bg-slate-50 border border-slate-100 uppercase tracking-widest">
                                                                {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                            </span>
                                                        </div>

                                                        {/* Inscritos */}
                                                        <div className="p-2 text-center">
                                                            <div className={cn(
                                                                "inline-flex flex-col items-center justify-center min-w-[40px] h-10 rounded-xl font-black text-sm border transition-all",
                                                                (evento.inscripciones?.[0]?.count || 0) > 0
                                                                    ? "text-cop-blue bg-blue-50/50 border-blue-100 shadow-sm group-hover:scale-110"
                                                                    : "text-slate-300 bg-slate-50/50 border-slate-100"
                                                            )}>
                                                                {evento.inscripciones?.[0]?.count || 0}
                                                            </div>
                                                        </div>

                                                        {/* Acciones */}
                                                        <div className="flex justify-end gap-2 py-4 pr-6">
                                                            <Link
                                                                href={`/admin/eventos/${evento.id}/editar`}
                                                                title="Editar evento"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 transition-all duration-300 hover:text-cop-blue hover:border-cop-blue hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-1 active:scale-95"
                                                            >
                                                                <Edit size={18} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(evento.id)}
                                                                title="Eliminar evento"
                                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 transition-all duration-300 hover:text-fpt-red hover:border-fpt-red hover:shadow-lg hover:shadow-red-900/10 hover:-translate-y-1 active:scale-95"
                                                            >
                                                                <Trash2 size={18} />
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
                    <div className="px-8 py-6 border-t border-slate-100 bg-white/60 backdrop-blur-md">
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
