'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { SelectEmptyState } from '@/components/EmptyState';
import { createClient } from '@/lib/supabase';
import { Modalidad, TipoEvento } from '@/lib/types';
import { eventoCreateSchema, EventoInput } from '@/lib/schemas';
import { Save, X, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, AlignLeft, UploadCloud, Loader2 } from 'lucide-react';

interface EventFormProps {
    initialData?: Partial<EventoInput> & { id?: string };
    isEditing?: boolean;
}

/**
 * Reusable Event Form Component
 * Handles both creating and editing events with Zod validation
 * & Image Upload to Supabase Storage
 */
export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [titulo, setTitulo] = useState(initialData?.titulo || '');
    const [modalidadId, setModalidadId] = useState(initialData?.modalidad_id || '');
    const [fecha, setFecha] = useState(initialData?.fecha || '');
    const [hora, setHora] = useState(initialData?.hora || '08:30');
    const [ubicacion, setUbicacion] = useState(initialData?.ubicacion || '');
    const [ubicacionUrl, setUbicacionUrl] = useState(
        initialData?.ubicacion_url || ''
    );
    const [imagenUrl, setImagenUrl] = useState(initialData?.imagen_url || '');
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
    const [tipoEventoId, setTipoEventoId] = useState(initialData?.tipo_evento_id || '');

    useEffect(() => {
        loadOptions();
    }, []);

    useEffect(() => {
        if (initialData) {
            setTitulo(initialData.titulo || '');
            setModalidadId(initialData.modalidad_id || '');
            setFecha(initialData.fecha || '');
            setHora(initialData.hora || '08:30');
            setUbicacion(initialData.ubicacion || '');
            setUbicacionUrl(initialData.ubicacion_url || '');
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
            if (modalidadesData.length > 0 && !modalidadId && !isEditing) {
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
            if (tiposData.length > 0 && !tipoEventoId && !isEditing) {
                setTipoEventoId(tiposData[0].id);
            }
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploading(true);

        try {
            const supabase = createClient();

            // 1. Upload file to 'eventos' bucket
            const { error: uploadError } = await supabase.storage
                .from('eventos')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('eventos')
                .getPublicUrl(filePath);

            setImagenUrl(publicUrl);
            showToast('Imagen subida correctamente', 'success');
        } catch (error: any) {
            console.error('Error uploading image:', error);
            showToast(`Error al subir imagen: ${error.message}`, 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Build form data
        const formData = {
            titulo,
            modalidad_id: modalidadId,
            fecha,
            hora: hora.slice(0, 5),
            ubicacion: ubicacion || null,
            ubicacion_url: ubicacionUrl || null,
            imagen_url: imagenUrl || null,
            descripcion: descripcion || null,
            tipo_evento_id: tipoEventoId || null,
        };

        const validation = eventoCreateSchema.safeParse(formData);

        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                const field = issue.path[0]?.toString() || 'general';
                fieldErrors[field] = issue.message;
            });
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

    // Styles for Elite Palette (Explicit Hex for Safety)
    const labelStyle = "block text-sm font-semibold text-[#1E3A8A] mb-1.5";
    const inputStyle = `block w-full rounded-lg border-slate-200 shadow-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20 sm:text-sm py-2.5 transition-all text-slate-700 bg-white`;
    const errorInputStyle = "border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50";
    const sectionHeaderStyle = "text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mb-6 pb-2 border-b border-slate-100";

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 animate-in fade-in duration-500">

            {/* --- General Information --- */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className={sectionHeaderStyle}>
                    <AlignLeft size={20} className="text-[#D91E18]" />
                    Información General
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label htmlFor="titulo" className={labelStyle}>
                            Título del evento <span className="text-[#D91E18]">*</span>
                        </label>
                        <input
                            id="titulo"
                            name="titulo"
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Torneo Apertura 2026"
                            required
                            className={`${inputStyle} ${errors.titulo ? errorInputStyle : ''}`}
                        />
                        {errors.titulo && <p className="mt-1 text-sm text-red-600 font-medium">{errors.titulo}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {modalidades.length === 0 ? (
                            <div className="col-span-2">
                                <SelectEmptyState entityName="modalidades" createHref="/admin/modalidades" />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="modalidad" className={labelStyle}>
                                    Modalidad <span className="text-[#D91E18]">*</span>
                                </label>
                                <select
                                    id="modalidad"
                                    name="modalidad_id"
                                    value={modalidadId}
                                    onChange={(e) => setModalidadId(e.target.value)}
                                    required
                                    className={`${inputStyle} ${errors.modalidad_id ? errorInputStyle : ''}`}
                                >
                                    {modalidades.map(mod => (
                                        <option key={mod.id} value={mod.id}>{mod.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label htmlFor="tipo" className={labelStyle}>
                                Tipo de evento <span className="text-[#D91E18]">*</span>
                            </label>
                            <select
                                id="tipo"
                                name="tipo_evento_id"
                                value={tipoEventoId}
                                onChange={(e) => setTipoEventoId(e.target.value)}
                                required
                                className={`${inputStyle} ${errors.tipo_evento_id ? errorInputStyle : ''}`}
                            >
                                {tiposEvento.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Date & Location --- */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className={sectionHeaderStyle}>
                    <Calendar size={20} className="text-[#D91E18]" />
                    Fecha y Ubicación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="fecha" className={labelStyle}>
                            Fecha <span className="text-[#D91E18]">*</span>
                        </label>
                        <input
                            id="fecha"
                            name="fecha"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            required
                            className={`${inputStyle} ${errors.fecha ? errorInputStyle : ''}`}
                        />
                        {errors.fecha && <p className="mt-1 text-sm text-red-600 font-medium">{errors.fecha}</p>}
                    </div>

                    <div>
                        <label htmlFor="hora" className={labelStyle}>Hora</label>
                        <input
                            id="hora"
                            name="hora"
                            type="time"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            className={inputStyle}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="ubicacion" className={labelStyle}>Ubicación / Polígono</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="ubicacion"
                                name="ubicacion"
                                type="text"
                                value={ubicacion}
                                onChange={(e) => setUbicacion(e.target.value)}
                                placeholder="Ej: COP - Polígono de 10m"
                                className={`${inputStyle} pl-10`}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="ubicacion_url" className={labelStyle}>Link Google Maps</label>
                        <div className="relative">
                            <LinkIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="ubicacion_url"
                                name="ubicacion_url"
                                type="url"
                                value={ubicacionUrl}
                                onChange={(e) => setUbicacionUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className={`${inputStyle} pl-10`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Multimedia & Description --- */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className={sectionHeaderStyle}>
                    <ImageIcon size={20} className="text-[#D91E18]" />
                    Multimedia
                </h3>

                <div className="space-y-6">
                    <div>
                        <span className={labelStyle}>Imagen del Evento</span>
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            {/* Preview Area */}
                            <div className="w-full md:w-1/3 aspect-video bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group hover:border-[#1E3A8A] transition-colors">
                                {imagenUrl ? (
                                    <>
                                        <img src={imagenUrl} alt="Visualización previa del evento" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImagenUrl('')}
                                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 focus:opacity-100"
                                            aria-label="Eliminar imagen"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-400">Sin imagen</p>
                                    </div>
                                )}
                            </div>

                            {/* Upload Actions */}
                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <p className="text-sm text-slate-500 mb-3">Sube una imagen (JPG, PNG) o pega una URL directa.</p>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#F9FBFF] hover:bg-slate-100 text-[#1E3A8A] border border-slate-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                            Subir Archivo
                                        </button>
                                        <input
                                            id="file-upload"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            aria-label="Subir archivo de imagen"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-2 text-xs text-slate-400 uppercase">O usa URL</span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="imagen-url-input" className="sr-only">URL de la imagen</label>
                                    <div className="relative">
                                        <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="imagen-url-input"
                                            type="url"
                                            value={imagenUrl}
                                            onChange={(e) => setImagenUrl(e.target.value)}
                                            placeholder="https://pagina.com/imagen.jpg"
                                            className={`${inputStyle} pl-10`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="descripcion" className={labelStyle}>Descripción Adicional</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={4}
                            className={`${inputStyle} resize-y`}
                            placeholder="Detalles sobre inscripciones, requisitos, etc..."
                        />
                    </div>
                </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex items-center justify-end gap-4 pt-6">
                <Link
                    href="/admin"
                    className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A] transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#D91E18] hover:bg-[#b91c1b] text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/10 hover:shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
