'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Inscripcion, Modalidad, Evento, TipoEvento } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    Plus,
    ArrowLeft,
    Edit2,
    Trash2,
    Phone,
    Mail,
    CheckCircle2,
    Clock,
    AlertCircle,
    Save,
    Filter,
    User,
    Calendar,
    CreditCard,
    ClipboardList
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function InscripcionesPage() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterModalidad, setFilterModalidad] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Form state
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [modalidadId, setModalidadId] = useState('');
    const [tipoEventoId, setTipoEventoId] = useState('');
    const [eventoId, setEventoId] = useState('');
    const [notas, setNotas] = useState('');
    const [montoPagado, setMontoPagado] = useState('');

    const { showToast } = useToast();

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Check if user is admin
        const allowedAdmins = ['admin@fpdt.org.py', 'admin@fpt.com'];
        if (!user.email || !allowedAdmins.includes(user.email)) {
            router.push('/');
            return;
        }

        loadData();
    }

    useEffect(() => {
        checkAuth();
    }, []);

    async function loadData() {
        await Promise.all([loadInscripciones(), loadModalidades(), loadEventos(), loadTiposEvento()]);
        setLoading(false);
    }

    async function loadInscripciones() {
        const supabase = createClient();
        const { data } = await supabase
            .from('inscripciones')
            .select(`
                *,
                modalidades (*),
                eventos (*),
                tipos_evento (*)
            `)
            .order('created_at', { ascending: false });

        if (data) setInscripciones(data);
    }

    async function loadModalidades() {
        const supabase = createClient();
        const { data } = await supabase.from('modalidades').select('*').order('nombre');
        if (data) {
            setModalidades(data);
            if (data.length > 0 && !modalidadId) setModalidadId(data[0].id);
        }
    }

    async function loadEventos() {
        const supabase = createClient();
        const { data } = await supabase.from('eventos').select('*').order('fecha');
        if (data) setEventos(data);
    }

    async function loadTiposEvento() {
        const supabase = createClient();
        const { data } = await supabase.from('tipos_evento').select('*').order('nombre');
        if (data) {
            setTiposEvento(data);
            if (data.length > 0 && !tipoEventoId) setTipoEventoId(data[0].id);
        }
    }

    // Security: Sanitization
    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const inscripcionData = {
            nombre: sanitize(nombre),
            telefono: sanitize(telefono),
            email: sanitize(email) || null,
            modalidad_id: modalidadId,
            tipo_evento_id: tipoEventoId || null,
            evento_id: eventoId || null,
            notas: sanitize(notas) || null,
            monto_pagado: montoPagado ? parseInt(montoPagado) : 0,
        };

        try {
            if (editingId) {
                await supabase.from('inscripciones').update(inscripcionData).eq('id', editingId);
                showToast('Inscripción actualizada correctamente', 'success');
            } else {
                await supabase.from('inscripciones').insert(inscripcionData);
                showToast('Inscripción creada correctamente', 'success');
            }

            closeModal();
            await loadInscripciones();
        } catch (error) {
            console.error('Error saving inscripcion:', error);
            showToast('Error al guardar la inscripción', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(insc: Inscripcion) {
        if (!confirm(`¿Eliminar la inscripción de "${insc.nombre}"?`)) return;
        const supabase = createClient();
        const { error } = await supabase.from('inscripciones').delete().eq('id', insc.id);
        if (error) {
            console.error('Error deleting inscripcion:', error);
            showToast('Error al eliminar la inscripción', 'error');
        } else {
            showToast('Inscripción eliminada', 'success');
            await loadInscripciones();
        }
    }

    async function toggleStatus(insc: Inscripcion) {
        const supabase = createClient();
        const currentStatus = insc.estado_pago || 'pendiente';
        let newStatus = 'pendiente';
        if (currentStatus === 'pendiente') newStatus = 'parcial';
        else if (currentStatus === 'parcial') newStatus = 'pagado';
        else if (currentStatus === 'pagado') newStatus = 'pendiente';

        const { error } = await supabase
            .from('inscripciones')
            .update({ estado_pago: newStatus })
            .eq('id', insc.id);

        if (error) {
            showToast('Error al actualizar estado', 'error');
        } else {
            showToast(`Estado cambiado a ${newStatus}`, 'success');
            loadInscripciones();
        }
    }

    const openModal = (insc?: Inscripcion) => {
        if (insc) {
            setEditingId(insc.id);
            setNombre(insc.nombre);
            setTelefono(insc.telefono);
            setEmail(insc.email || '');
            setModalidadId(insc.modalidad_id);
            setTipoEventoId(insc.tipo_evento_id || tiposEvento[0]?.id || '');
            setEventoId(insc.evento_id || '');
            setNotas(insc.notas || '');
            setMontoPagado(insc.monto_pagado?.toString() || '');
        } else {
            setEditingId(null);
            setNombre('');
            setTelefono('');
            setEmail('');
            setModalidadId(modalidades[0]?.id || '');
            setTipoEventoId(tiposEvento[0]?.id || '');
            setEventoId('');
            setNotas('');
            setMontoPagado('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const filteredInscripciones = filterModalidad
        ? inscripciones.filter(i => i.modalidad_id === filterModalidad)
        : inscripciones;

    const eventosDeModalidad = eventos.filter(e => e.modalidad_id === modalidadId);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1400px] mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inscripciones</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium mt-2 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        <EliteButton
                            onClick={() => openModal()}
                            icon={<Plus size={18} />}
                        >
                            Nueva Inscripción
                        </EliteButton>
                    </div>

                    {/* Content */}
                    <EliteCard
                        title={`Participantes (${filteredInscripciones.length})`}
                        action={
                            <div className="relative min-w-[200px]">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter size={16} className="text-slate-400" />
                                </div>
                                <select
                                    value={filterModalidad}
                                    onChange={(e) => setFilterModalidad(e.target.value)}
                                    className="block w-full pl-10 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
                                >
                                    <option value="">Todas las modalidades</option>
                                    {modalidades.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        }
                        noPadding
                    >
                        <EliteTable
                            data={filteredInscripciones}
                            gridCols="2fr 1.5fr 1.5fr 1.5fr 120px 100px 100px"
                            constrainMinWidth
                            keyExtractor={(i) => i.id}
                            header={
                                <>
                                    <EliteHeader>Nombre</EliteHeader>
                                    <EliteHeader>Contacto</EliteHeader>
                                    <EliteHeader>Modalidad / Tipo</EliteHeader>
                                    <EliteHeader>Evento</EliteHeader>
                                    <EliteHeader align="center">Estado</EliteHeader>
                                    <EliteHeader align="right">Monto</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(insc) => (
                                <>
                                    <EliteCell>
                                        <span className="font-bold text-slate-800 text-sm">{insc.nombre}</span>
                                    </EliteCell>
                                    <EliteCell>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <a
                                                href={`https://wa.me/595${insc.telefono.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-green-600 transition-colors font-medium text-slate-600"
                                            >
                                                <Phone size={12} />
                                                {insc.telefono}
                                            </a>
                                            {insc.email && (
                                                <span className="flex items-center gap-1 text-slate-400">
                                                    <Mail size={12} />
                                                    <span className="truncate max-w-[150px]">{insc.email}</span>
                                                </span>
                                            )}
                                        </div>
                                    </EliteCell>
                                    <EliteCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${insc.modalidades?.color}15`,
                                                    color: insc.modalidades?.color || '#64748B'
                                                }}
                                            >
                                                {insc.modalidades?.nombre}
                                            </span>
                                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {insc.tipos_evento?.nombre || '-'}
                                            </span>
                                        </div>
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="text-sm text-slate-600 line-clamp-2">
                                            {insc.eventos?.titulo || 'General'}
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        <button
                                            onClick={() => toggleStatus(insc)}
                                            className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all hover:scale-105 active:scale-95 ${insc.estado_pago === 'pagado'
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                : insc.estado_pago === 'parcial'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                }`}
                                            title="Clic para cambiar estado"
                                        >
                                            {insc.estado_pago === 'pagado' ? (
                                                <><CheckCircle2 size={12} className="mr-1" /> Pagado</>
                                            ) : insc.estado_pago === 'parcial' ? (
                                                <><AlertCircle size={12} className="mr-1" /> Parcial</>
                                            ) : (
                                                <><Clock size={12} className="mr-1" /> Pendiente</>
                                            )}
                                        </button>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <span className="font-mono text-xs font-semibold text-slate-700">
                                            {(insc.monto_pagado || 0).toLocaleString('es-PY')} Gs
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(insc)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(insc)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </EliteCell>
                                </>
                            )}
                        />
                    </EliteCard>
                </div>
            </main>

            {/* Modal */}
            <EliteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? 'Editar Inscripción' : 'Nueva Inscripción'}
                width="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Sección 1: Datos Personales */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <User size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Datos del Tirador
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Juan Pérez"
                                        required
                                        maxLength={100}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                        placeholder="0981 123 456"
                                        required
                                        maxLength={20}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Email (Opcional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        maxLength={100}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Detalles del Evento */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <Calendar size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Selección de Evento
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Modalidad
                                </label>
                                <select
                                    value={modalidadId}
                                    onChange={(e) => {
                                        setModalidadId(e.target.value);
                                        setEventoId('');
                                    }}
                                    required
                                    className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                                >
                                    <option value="">Seleccionar Modalidad</option>
                                    {modalidades.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Tipo de Evento
                                </label>
                                <select
                                    value={tipoEventoId}
                                    onChange={(e) => setTipoEventoId(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                                >
                                    <option value="">Seleccionar Tipo</option>
                                    {tiposEvento.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Evento (Opcional)
                                </label>
                                <select
                                    value={eventoId}
                                    onChange={(e) => setEventoId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                                >
                                    <option value="">-- Inscripción General (Sin evento específico) --</option>
                                    {eventosDeModalidad.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-ES')} - {e.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Finanzas y Notas */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <CreditCard size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Pago y Observaciones
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Monto Abonado
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold text-sm">₲</span>
                                    <input
                                        type="number"
                                        value={montoPagado}
                                        onChange={(e) => setMontoPagado(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full pl-7 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-slate-800"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Notas
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
                                        <ClipboardList size={16} />
                                    </div>
                                    <textarea
                                        value={notas}
                                        onChange={(e) => setNotas(e.target.value)}
                                        placeholder="Observaciones adicionales..."
                                        rows={2}
                                        maxLength={500}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 resize-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton type="submit" isLoading={saving} icon={<Save size={16} />}>
                            Guardar
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
