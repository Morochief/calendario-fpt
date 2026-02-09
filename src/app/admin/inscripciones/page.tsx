'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
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
    Filter
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

        if (editingId) {
            await supabase.from('inscripciones').update(inscripcionData).eq('id', editingId);
        } else {
            await supabase.from('inscripciones').insert(inscripcionData);
        }

        resetForm();
        await loadInscripciones();
        setSaving(false);
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
        await supabase.from('inscripciones').delete().eq('id', id);
        await loadInscripciones();
    }

    const filteredInscripciones = filterModalidad
        ? inscripciones.filter(i => i.modalidad_id === filterModalidad)
        : inscripciones;

    const eventosDeModalidad = eventos.filter(e => e.modalidad_id === modalidadId);

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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Inscripciones</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-1"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Nueva Inscripción
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-slate-900">
                                    {editingId ? 'Editar Inscripción' : 'Nueva Inscripción'}
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
                                            <input
                                                id="nombre"
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Juan Pérez"
                                                required
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                                            <input
                                                id="telefono"
                                                type="tel"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                placeholder="0981 123 456"
                                                required
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email (opcional)</label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="modalidad" className="block text-sm font-medium text-slate-700 mb-1">Modalidad *</label>
                                            <select
                                                id="modalidad"
                                                value={modalidadId}
                                                onChange={(e) => {
                                                    setModalidadId(e.target.value);
                                                    setEventoId('');
                                                }}
                                                required
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            >
                                                {modalidades.map(m => (
                                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="tipoEvento" className="block text-sm font-medium text-slate-700 mb-1">Tipo de Evento *</label>
                                            <select
                                                id="tipoEvento"
                                                value={tipoEventoId}
                                                onChange={(e) => setTipoEventoId(e.target.value)}
                                                required
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            >
                                                {tiposEvento.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="evento" className="block text-sm font-medium text-slate-700 mb-1">Evento específico (opcional)</label>
                                            <select
                                                id="evento"
                                                value={eventoId}
                                                onChange={(e) => setEventoId(e.target.value)}
                                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                        <label htmlFor="notas" className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                                        <textarea
                                            id="notas"
                                            value={notas}
                                            onChange={(e) => setNotas(e.target.value)}
                                            placeholder="Observaciones adicionales..."
                                            rows={2}
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-y"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="monto" className="block text-sm font-medium text-slate-700 mb-1">Monto Abonado (Gs)</label>
                                        <input
                                            id="monto"
                                            type="number"
                                            value={montoPagado}
                                            onChange={(e) => setMontoPagado(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            step="5000"
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : (
                                                <>
                                                    <Save size={16} className="mr-2" />
                                                    Guardar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-medium text-slate-900">
                                Participantes ({filteredInscripciones.length})
                            </h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter size={16} className="text-slate-400" />
                                </div>
                                <select
                                    value={filterModalidad}
                                    onChange={(e) => setFilterModalidad(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 text-sm border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todas las modalidades</option>
                                    {modalidades.map(m => (
                                        <option key={m.id} value={m.id}>{m.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {filteredInscripciones.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <Search size={32} className="text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 mb-1">No hay inscripciones</p>
                                <p>No se encontraron inscripciones con los filtros actuales.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contacto</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Modalidad / Tipo</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Evento</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {filteredInscripciones.map((insc: Inscripcion & { tipos_evento?: TipoEvento }) => (
                                            <tr key={insc.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-slate-900">{insc.nombre}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-500 flex flex-col gap-1">
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
                                                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block w-fit">
                                                            {insc.tipos_evento?.nombre || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {insc.eventos?.titulo || 'General'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={async () => {
                                                            const supabase = createClient();
                                                            // Cycle: Pendiente -> Parcial -> Pagado -> Pendiente
                                                            const currentStatus = insc.estado_pago || 'pendiente';
                                                            let newStatus = 'pendiente';
                                                            if (currentStatus === 'pendiente') newStatus = 'parcial';
                                                            else if (currentStatus === 'parcial') newStatus = 'pagado';
                                                            else if (currentStatus === 'pagado') newStatus = 'pendiente';

                                                            await supabase
                                                                .from('inscripciones')
                                                                .update({ estado_pago: newStatus })
                                                                .eq('id', insc.id);
                                                            loadInscripciones();
                                                        }}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border hover:opacity-80 transition-opacity ${insc.estado_pago === 'pagado'
                                                                ? 'bg-green-100 text-green-800 border-green-200'
                                                                : insc.estado_pago === 'parcial'
                                                                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                                                                    : 'bg-red-100 text-red-800 border-red-200'
                                                            }`}
                                                        title="Click para cambiar: Pendiente -> Parcial -> Pagado"
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    Gs. {(insc.monto_pagado || 0).toLocaleString('es-PY')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(insc)}
                                                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(insc.id)}
                                                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                                                            title="Eliminar"
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
