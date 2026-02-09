'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { SelectEmptyState } from '@/components/EmptyState';
import { createClient } from '@/lib/supabase';
import { Modalidad, TipoEvento } from '@/lib/types';
import { eventoCreateSchema, EventoInput } from '@/lib/schemas';
import { Save, X, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, AlignLeft } from 'lucide-react';

interface EventFormProps {
    initialData?: Partial<EventoInput> & { id?: string };
    isEditing?: boolean;
}

/**
 * Reusable Event Form Component
 * Handles both creating and editing events with Zod validation
 */
export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { showToast } = useToast();

    // Form state
    const [titulo, setTitulo] = useState(initialData?.titulo || '');
    const [modalidadId, setModalidadId] = useState(initialData?.modalidad_id || '');
    const [fecha, setFecha] = useState(initialData?.fecha || '');
    const [hora, setHora] = useState(initialData?.hora || '08:30');
    const [ubicacion, setUbicacion] = useState(initialData?.ubicacion || '');
    const [ubicacionUrl, setUbicacionUrl] = useState(
        initialData?.ubicacion_url || 'https://maps.app.goo.gl/weBjZMXHERaafE858?g_st=aw'
    );
    const [imagenUrl, setImagenUrl] = useState(initialData?.imagen_url || '');
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
    const [tipoEventoId, setTipoEventoId] = useState(initialData?.tipo_evento_id || '');

    useEffect(() => {
        loadOptions();
    }, []);

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setTitulo(initialData.titulo || '');
            setModalidadId(initialData.modalidad_id || '');
            setFecha(initialData.fecha || '');
            setHora(initialData.hora || '08:30');
            setUbicacion(initialData.ubicacion || '');
            setUbicacionUrl(initialData.ubicacion_url || 'https://maps.app.goo.gl/weBjZMXHERaafE858?g_st=aw');
            setImagenUrl(initialData.imagen_url || '');
            setDescripcion(initialData.descripcion || '');
            setTipoEventoId(initialData.tipo_evento_id || '');
        }
    }, [initialData]);

    async function loadOptions() {
        const supabase = createClient();

        // Load modalidades
        const { data: modalidadesData } = await supabase
            .from('modalidades')
            .select('*')
            .order('nombre');

        if (modalidadesData) {
            setModalidades(modalidadesData);
            if (modalidadesData.length > 0 && !modalidadId) {
                setModalidadId(modalidadesData[0].id);
            }
        }

        // Load tipos de evento
        const { data: tiposData } = await supabase
            .from('tipos_evento')
            .select('*')
            .order('nombre');

        if (tiposData) {
            setTiposEvento(tiposData);
            if (tiposData.length > 0 && !tipoEventoId) {
                setTipoEventoId(tiposData[0].id);
            }
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Build form data
        const formData = {
            titulo,
            modalidad_id: modalidadId,
            fecha,
            // Ensure time is HH:MM (strip seconds if present)
            hora: hora.slice(0, 5),
            ubicacion: ubicacion || null,
            ubicacion_url: ubicacionUrl || null,
            imagen_url: imagenUrl || null,
            descripcion: descripcion || null,
            tipo_evento_id: tipoEventoId || null,
        };

        // Validate with Zod
        const validation = eventoCreateSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                const field = issue.path[0]?.toString() || 'general';
                fieldErrors[field] = issue.message;
            });
            console.error('❌ Errores de validación Zod:', fieldErrors); // Log para debug
            setErrors(fieldErrors);
            showToast('Por favor corrige los errores del formulario', 'error');
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            if (isEditing && initialData?.id) {
                const { error } = await supabase
                    .from('eventos')
                    .update(validation.data)
                    .eq('id', initialData.id);

                if (error) throw error;
                showToast('Evento actualizado correctamente', 'success');
            } else {
                const { error } = await supabase
                    .from('eventos')
                    .insert(validation.data);

                if (error) throw error;
                showToast('Evento creado correctamente', 'success');
            }

            router.push('/admin');
            router.refresh();
        } catch (err) {
            console.error('Error saving event:', err);
            showToast('Error al guardar el evento', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
                    Información General
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">
                            Título del evento <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="titulo"
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: 1.ª Fecha Campeonato Nacional"
                            required
                            aria-invalid={!!errors.titulo}
                            className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.titulo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                        />
                        {errors.titulo && (
                            <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                        )}
                    </div>

                    {modalidades.length === 0 ? (
                        <SelectEmptyState entityName="modalidades" createHref="/admin/modalidades" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="modalidad" className="block text-sm font-medium text-slate-700 mb-1">
                                    Modalidad <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="modalidad"
                                    value={modalidadId}
                                    onChange={(e) => setModalidadId(e.target.value)}
                                    required
                                    className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.modalidad_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                >
                                    {modalidades.map(mod => (
                                        <option key={mod.id} value={mod.id}>
                                            {mod.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.modalidad_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.modalidad_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-1">
                                    Tipo de evento <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="tipo"
                                    value={tipoEventoId}
                                    onChange={(e) => setTipoEventoId(e.target.value)}
                                    required
                                    className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.tipo_evento_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                        }`}
                                >
                                    {tiposEvento.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Calendar size={20} className="text-slate-400" />
                    Fecha y Hora
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fecha"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                            className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.fecha ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                }`}
                        />
                        {errors.fecha && (
                            <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="hora" className="block text-sm font-medium text-slate-700 mb-1">
                            Hora
                        </label>
                        <input
                            id="hora"
                            type="time"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <MapPin size={20} className="text-slate-400" />
                    Ubicación
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="ubicacion" className="block text-sm font-medium text-slate-700 mb-1">
                            Ubicación / Polígono
                        </label>
                        <input
                            id="ubicacion"
                            type="text"
                            value={ubicacion}
                            onChange={(e) => setUbicacion(e.target.value)}
                            placeholder="Ej: Polígono de Tiro 10M - Comité Olímpico Paraguayo"
                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="ubicacion_url" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                                <LinkIcon size={14} className="text-slate-400" />
                                Link de Ubicación (Google Maps)
                            </label>
                            <input
                                id="ubicacion_url"
                                type="url"
                                value={ubicacionUrl}
                                onChange={(e) => setUbicacionUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.ubicacion_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                            />
                            {errors.ubicacion_url && (
                                <p className="mt-1 text-sm text-red-600">{errors.ubicacion_url}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="imagen_url" className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                                <ImageIcon size={14} className="text-slate-400" />
                                URL de Imagen (opcional)
                            </label>
                            <input
                                id="imagen_url"
                                type="url"
                                value={imagenUrl}
                                onChange={(e) => setImagenUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className={`block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.imagen_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                            />
                            {errors.imagen_url && (
                                <p className="mt-1 text-sm text-red-600">{errors.imagen_url}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <AlignLeft size={20} className="text-slate-400" />
                    Detalles Adicionales
                </h3>

                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1">
                        Descripción (opcional)
                    </label>
                    <textarea
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Información adicional sobre el evento..."
                        rows={4}
                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-y"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <Link
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <X size={16} className="mr-2" />
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={16} className="mr-2" />
                            {isEditing ? 'Guardar Cambios' : 'Guardar Evento'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
