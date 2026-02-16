'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase';
import { Inscripcion, Modalidad, Evento, TipoEvento } from '@/lib/types';
import {
    Plus,
    ArrowLeft,
    Search,
    Edit2,
    Trash2,
    Phone,
    Mail,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Save,
    Filter,
    Loader2,
    Users
} from 'lucide-react';

export default function InscripcionesPage() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filterModalidad, setFilterModalidad] = useState<string>('');

    // Form state
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [modalidadId, setModalidadId] = useState('');
    const [tipoEventoId, setTipoEventoId] = useState('');
    const [eventoId, setEventoId] = useState('');
    const [notas, setNotas] = useState('');
    const [montoPagado, setMontoPagado] = useState('');
    const [saving, setSaving] = useState(false);

    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        checkAuthAndLoad();
    }, []);

    async function checkAuthAndLoad() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

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

        if (data) {
            setInscripciones(data);
        }
    }

    async function loadModalidades() {
        const supabase = createClient();
        const { data } = await supabase.from('modalidades').select('*').order('nombre');
        if (data) {
            setModalidades(data);
            if (data.length > 0 && !modalidadId) {
                setModalidadId(data[0].id);
                setMontoPagado('');
            }
        }
    }

    async function loadEventos() {
        const supabase = createClient();
        const { data } = await supabase.from('eventos').select('*').order('fecha');
        if (data) {
            setEventos(data);
        }
    }

    async function loadTiposEvento() {
        const supabase = createClient();
        const { data } = await supabase.from('tipos_evento').select('*').order('nombre');
        if (data) {
            setTiposEvento(data);
            if (data.length > 0 && !tipoEventoId) {
                setTipoEventoId(data[0].id);
            }
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const supabase = createClient();

        const inscripcionData = {
            nombre,
            telefono,
            email: email || null,
            modalidad_id: modalidadId,
            tipo_evento_id: tipoEventoId || null,
            evento_id: eventoId || null,
            notas: notas || null,
            monto_pagado: montoPagado ? parseInt(montoPagado) : 0,
        };

        try {
            if (editingId) {
                await supabase.from('inscripciones').update(inscripcionData).eq('id', editingId);
            } else {
                await supabase.from('inscripciones').insert(inscripcionData);
            }

            showToast(editingId ? 'Inscripción actualizada' : 'Inscripción creada', 'success');
            resetForm();
            await loadInscripciones();
        } catch {
            showToast('Error al guardar la inscripción', 'error');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setNombre('');
        setTelefono('');
        setEmail('');
        setModalidadId(modalidades[0]?.id || '');
        setTipoEventoId(tiposEvento[0]?.id || '');
        setEventoId('');
        setNotas('');
        setMontoPagado('');
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(insc: Inscripcion & { tipo_evento_id?: string }) {
        setEditingId(insc.id);
        setNombre(insc.nombre);
        setTelefono(insc.telefono);
        setEmail(insc.email || '');
        setModalidadId(insc.modalidad_id);
        setTipoEventoId(insc.tipo_evento_id || tiposEvento[0]?.id || '');
        setEventoId(insc.evento_id || '');
        setNotas(insc.notas || '');
        setMontoPagado(insc.monto_pagado?.toString() || '');
        setShowForm(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Eliminar esta inscripción?')) return;
        const supabase = createClient();
        const { error } = await supabase.from('inscripciones').delete().eq('id', id);
        if (error) {
            showToast('Error al eliminar la inscripción', 'error');
        } else {
            showToast('Inscripción eliminada', 'success');
            await loadInscripciones();
        }
    }

    const filteredInscripciones = filterModalidad
        ? inscripciones.filter(i => i.modalidad_id === filterModalidad)
        : inscripciones;

    const eventosDeModalidad = eventos.filter(e => e.modalidad_id === modalidadId);

    // Styles
    const labelStyle = "block text-sm font-medium text-text-elite mb-1.5";
    const inputStyle = "block w-full rounded-elite-sm border-border-elite shadow-elite-xs focus:border-cop-blue focus:ring-1 focus:ring-cop-blue/20 sm:text-sm py-2.5 transition-all text-text-secondary bg-surface hover:border-border-hover";

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
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 animate-page-enter">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Breadcrumbs />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-elite tracking-tight">Inscripciones</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-cop-blue transition-colors mt-1"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95"
                            >
                                <Plus size={16} />
                                Nueva Inscripción
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-surface rounded-xl shadow-elite-sm border border-border-elite overflow-hidden animate-in fade-in duration-300">
                            <div className="border-b border-border-elite px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-elite">
                                    {editingId ? 'Editar Inscripción' : 'Nueva Inscripción'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="text-text-muted hover:text-text-elite transition-colors p-1 rounded-lg hover:bg-bg-elite"
                                    aria-label="Cerrar formulario"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="nombre" className={labelStyle}>Nombre completo *</label>
                                            <input
                                                id="nombre"
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Juan Pérez"
                                                required
                                                maxLength={100}
                                                className={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className={labelStyle}>Teléfono *</label>
                                            <input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="0981 123 456"
                                                required
                                                maxLength={20}
                                                className={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className={labelStyle}>Email (opcional)</label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                maxLength={100}
                                                className={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="modalidad" className={labelStyle}>Modalidad *</label>
                                            <select
                                                id="modalidad"
                                                value={modalidadId}
                                                onChange={(e) => {
                                                    setModalidadId(e.target.value);
                                                    setEventoId('');
                                                }}
                                                required
                                                className={inputStyle}
                                            >
                                                {modalidades.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="tipoEvento" className={labelStyle}>Tipo de Evento *</label>
                                            <select
                                                id="tipoEvento"
                                                value={tipoEventoId}
                                                onChange={(e) => setTipoEventoId(e.target.value)}
                                                required
                                                className={inputStyle}
                                            >
                                                {tiposEvento.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="evento" className={labelStyle}>Evento específico (opcional)</label>
                                            <select
                                                id="evento"
                                                value={eventoId}
                                                onChange={(e) => setEventoId(e.target.value)}
                                                className={inputStyle}
                                            >
                                                <option value="">-- Inscripción general --</option>
                                                {eventosDeModalidad.map(e => (
                                                    <option key={e.id} value={e.id}>
                                                        {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-ES')} - {e.titulo}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="notas" className={labelStyle}>Notas (opcional)</label>
                                        <textarea
                                            id="notas"
                                            value={notas}
                                            onChange={(e) => setNotas(e.target.value)}
                                            placeholder="Observaciones adicionales..."
                                            rows={2}
                                            maxLength={500}
                                            className={`${inputStyle} resize-y`}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="monto" className={labelStyle}>Monto Abonado (Gs)</label>
                                        <input
                                            id="monto"
                                            type="number"
                                            value={montoPagado}
                                            onChange={(e) => setMontoPagado(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="5000"
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-border-elite">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="btn btn-secondary shadow-elite-xs"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : (
                                                <>
                                                    <Save size={16} />
                                                    Guardar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface rounded-xl shadow-elite-sm border border-border-elite overflow-hidden">
                        <div className="border-b border-border-elite px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-text-elite">
                                Participantes ({filteredInscripciones.length})
                            </h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter size={16} className="text-text-muted" />
                                </div>
                                <select
                                    value={filterModalidad}
                                    onChange={(e) => setFilterModalidad(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 text-sm border-border-elite rounded-elite-sm focus:ring-cop-blue focus:border-cop-blue bg-surface text-text-secondary"
                                >
                                    <option value="">Todas las modalidades</option>
                                    {modalidades.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {filteredInscripciones.length === 0 ? (
                            <div className="p-12 text-center text-text-secondary">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elite mb-4">
                                    <Users size={32} className="text-text-muted" />
                                </div>
                                <p className="text-lg font-medium text-text-elite mb-1">No hay inscripciones</p>
                                <p>No se encontraron inscripciones con los filtros actuales.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border-elite">
                                    <thead className="bg-bg-elite">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Nombre</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Contacto</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Modalidad / Tipo</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Evento</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Monto</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-surface divide-y divide-border-elite">
                                        {filteredInscripciones.map((insc: Inscripcion & { tipos_evento?: TipoEvento }) => (
                                            <tr key={insc.id} className="hover:bg-bg-elite transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-text-elite">{insc.nombre}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-text-secondary flex flex-col gap-1">
                                                        <a
                                                            href={`https://wa.me/595${insc.telefono.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
                                                        >
                                                            <Phone size={14} />
                                                            {insc.telefono}
                                                        </a>
                                                        {insc.email && (
                                                            <span className="flex items-center gap-1.5">
                                                                <Mail size={14} />
                                                                {insc.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${insc.modalidades?.color}15`,
                                                                color: insc.modalidades?.color
                                                            }}
                                                        >
                                                            {insc.modalidades?.nombre}
                                                        </span>
                                                        <span className="text-xs text-text-secondary bg-bg-elite px-2 py-0.5 rounded-full inline-block w-fit">
                                                            {insc.tipos_evento?.nombre || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {insc.eventos?.titulo || 'General'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={async () => {
                                                            const supabase = createClient();
                                                            const currentStatus = insc.estado_pago || 'pendiente';
                                                            let newStatus = 'pendiente';
                                                            if (currentStatus === 'pendiente') newStatus = 'parcial';
                                                            else if (currentStatus === 'parcial') newStatus = 'pagado';
                                                            else if (currentStatus === 'pagado') newStatus = 'pendiente';

                                                            await supabase
                                                                .from('inscripciones')
                                                                .update({ estado_pago: newStatus })
                                                                .eq('id', insc.id);
                                                            showToast(`Estado cambiado a ${newStatus}`, 'success');
                                                            loadInscripciones();
                                                        }}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border hover:opacity-80 transition-opacity ${insc.estado_pago === 'pagado'
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : insc.estado_pago === 'parcial'
                                                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                                                : 'bg-red-100 text-red-800 border-red-200'
                                                            }`}
                                                        title="Click para cambiar: Pendiente -> Parcial -> Pagado"
                                                        aria-label={`Estado de pago: ${insc.estado_pago || 'pendiente'}. Click para cambiar.`}
                                                    >
                                                        {insc.estado_pago === 'pagado' ? (
                                                            <><CheckCircle2 size={12} className="mr-1" /> PAGADO</>
                                                        ) : insc.estado_pago === 'parcial' ? (
                                                            <><AlertCircle size={12} className="mr-1" /> PARCIAL</>
                                                        ) : (
                                                            <><Clock size={12} className="mr-1" /> PENDIENTE</>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-elite">
                                                    Gs. {(insc.monto_pagado || 0).toLocaleString('es-PY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(insc)}
                                                            className="p-2 text-text-muted hover:text-cop-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                            aria-label={`Editar inscripción de ${insc.nombre}`}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(insc.id)}
                                                            className="p-2 text-text-muted hover:text-fpt-red hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                            aria-label={`Eliminar inscripción de ${insc.nombre}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
