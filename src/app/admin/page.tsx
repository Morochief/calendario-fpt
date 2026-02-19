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
import { cn, isAllowedAdmin } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

export default function AdminPage() {
    const [eventos, setEventos] = useState<(Evento & {
        modalidades: Modalidad;
        tipos_evento?: TipoEvento;
        inscripciones?: { count: number }[];
    })[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [weeklyInscriptions, setWeeklyInscriptions] = useState(0);

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
        if (!isAllowedAdmin(user.email)) {
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

        // Fetch weekly inscriptions count
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count, error: countError } = await supabase
            .from('inscripciones')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', oneWeekAgo.toISOString());

        if (!countError) {
            setWeeklyInscriptions(count || 0);
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

    // Export functionality
    const exportToExcel = () => {
        if (filteredEventos.length === 0) {
            showToast('No hay eventos para exportar', 'info');
            return;
        }

        import('xlsx').then(XLSX => {
            const dataToExport = filteredEventos.map(evento => ({
                ID: evento.id.substring(0, 8),
                Fecha: evento.fecha,
                Evento: evento.titulo,
                Estado: getEventStatus(evento.fecha).toUpperCase(),
                Modalidad: evento.modalidades?.nombre || '',
                Tipo: evento.tipos_evento?.nombre || evento.tipo || '',
                Inscritos: evento.inscripciones?.[0]?.count || 0,
                'Club Organizador': evento.clubes?.nombre || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos');

            XLSX.writeFile(workbook, `eventos_fpt_${new Date().toISOString().split('T')[0]}.xlsx`);
            showToast('Archivo Excel exportado correctamente', 'success');
        }).catch(err => {
            console.error('Error importing xlsx:', err);
            showToast('Error al exportar a Excel', 'error');
        });
    };

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
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-cop-blue font-bold text-sm transition-all duration-200 hover:border-cop-blue hover:bg-blue-50 hover:shadow-md active:scale-95"
                        >
                            <Download size={18} strokeWidth={2.5} />
                            <span>Exportar</span>
                        </button>

                        <Link
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 bg-[#D91E18] text-white hover:bg-cop-blue shadow-md shadow-red-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-0.5 active:translate-y-0"
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
                        trend={weeklyInscriptions > 0 ? `+${weeklyInscriptions} esta semana` : "Sin nuevas"}
                        trendColor={weeklyInscriptions > 0 ? "text-emerald-600" : "text-slate-400"}
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



                {/* ========== CONFIGURACIÓN GLOBAL ========== */}
                <div className="grid grid-cols-1 mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 ease-out relative overflow-hidden">

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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10 w-full">
                            <Link className="flex flex-col items-center justify-center gap-3 p-4 bg-white/50 hover:bg-white text-slate-600 rounded-xl border border-slate-200 transition-all duration-200 font-bold text-sm hover:border-fpt-red hover:text-fpt-red hover:shadow-lg hover:-translate-y-1 active:scale-95 group/link h-full relative overflow-hidden"
                                href="/admin/inscripciones">
                                <div className="absolute top-2 right-2 bg-red-100 text-fpt-red text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 shadow-sm z-20">
                                    {kpiInscripciones}
                                </div>
                                <div className="p-3 bg-slate-50 rounded-full group-hover/link:bg-red-50 transition-colors relative z-10">
                                    <Users size={24} className="text-slate-400 group-hover/link:text-fpt-red transition-colors" />
                                </div>
                                <span className="text-center group-hover/link:text-fpt-red relative z-10">Inscripciones</span>
                            </Link>
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
                    <div className="p-6 bg-slate-50/50 overflow-hidden min-h-[400px]">
                        {/* Headers */}
                        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[48px_140px_1.5fr_120px_180px_110px_80px_100px] items-center px-4 mb-3 gap-4">
                            <div className="hidden md:flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cop-blue focus:ring-blue-500/20 transition-all cursor-pointer" />
                            </div>
                            <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2">Fecha</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2">Evento</div>
                            <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Estado</div>
                            <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Modalidad</div>
                            <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Tipo</div>
                            <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-center">Inscritos</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] py-3 px-2 text-right">Acciones</div>
                        </div>

                        {/* Data Rows */}
                        <div className="flex flex-col gap-3 stagger-children">
                            {paginatedEventos.length === 0 ? (
                                <div className="py-20 text-center bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <Search size={32} className="text-slate-300" />
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-700 mb-2">No se encontraron eventos</h4>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setFilterEstado('');
                                            setFilterModalidad('');
                                            setFilterTipo('');
                                        }}
                                        className="mt-4 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-cop-blue font-bold text-sm hover:border-cop-blue hover:bg-blue-50 transition-all shadow-sm"
                                    >
                                        Limpiar filtros
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
                                            className="group relative grid grid-cols-[1fr_auto] md:grid-cols-[48px_140px_1.5fr_120px_180px_110px_80px_100px] items-center bg-white rounded-xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:border-cop-blue/20 hover:-translate-y-0.5 hover:z-10 animate-fade-in gap-4 p-4 md:p-0"
                                            style={{ animationDelay: `${idx * 0.03}s` }}
                                        >
                                            {/* Checkbox */}
                                            <div className="hidden md:block px-4 py-5">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-cop-blue focus:ring-blue-500/20 transition-all cursor-pointer" />
                                            </div>

                                            {/* Fecha (Desktop) */}
                                            <div className="hidden md:block p-2">
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

                                            {/* Título + Mobile Info */}
                                            <div className="p-2 overflow-hidden flex flex-col justify-center">
                                                {/* Mobile Date/Status Badge */}
                                                <div className="md:hidden flex items-center gap-2 mb-1.5">
                                                    <span className="text-xs font-semibold text-slate-500">
                                                        {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                                                        status === 'activo' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                                    )}>
                                                        {status}
                                                    </span>
                                                    {isNext && (
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">PROX</span>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/admin/eventos/${evento.id}/editar`}
                                                    className="font-bold text-slate-800 text-base block truncate transition-all group-hover:text-cop-blue"
                                                >
                                                    {evento.titulo}
                                                </Link>

                                                {/* Mobile Secondary Info */}
                                                <div className="md:hidden flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                    {evento.modalidades && (
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: evento.modalidades.color }} />
                                                            {evento.modalidades.nombre}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Desktop ID (Hidden on Mobile as requested) */}
                                                <p className="hidden md:block text-[10px] text-slate-400 mt-0.5 group-hover:text-slate-500 transition-colors uppercase tracking-widest font-semibold">
                                                    ID: {evento.id.substring(0, 8)}
                                                </p>
                                            </div>

                                            {/* Estado (Desktop) */}
                                            <div className="hidden md:block p-2 text-center">
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

                                            {/* Modalidad (Desktop) */}
                                            <div className="hidden md:block p-2 text-center">
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

                                            {/* Tipo (Desktop) */}
                                            <div className="hidden md:block p-2 text-center">
                                                <span className="inline-flex text-[10px] font-bold px-3 py-1.5 rounded-lg text-slate-500 bg-slate-50 border border-slate-100 uppercase tracking-widest">
                                                    {evento.tipos_evento?.nombre || evento.tipo || '-'}
                                                </span>
                                            </div>

                                            {/* Inscritos (Desktop) */}
                                            <div className="hidden md:block p-2 text-center">
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
                                            <div className="flex justify-end gap-2 py-4 pr-6 md:py-4 md:pr-6">
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
