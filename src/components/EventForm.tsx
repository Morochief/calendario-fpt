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

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [titulo, setTitulo] = useState(initialData?.titulo || '');
    const [modalidadId, setModalidadId] = useState(initialData?.modalidad_id || '');
    const [fecha, setFecha] = useState(initialData?.fecha || '');
    const [hora, setHora] = useState(initialData?.hora || '08:30');
    const [ubicacion, setUbicacion] = useState(initialData?.ubicacion || '');
    const [ubicacionUrl, setUbicacionUrl] = useState(initialData?.ubicacion_url || '');
    const [imagenUrl, setImagenUrl] = useState(initialData?.imagen_url || '');
    const [imagenPosition, setImagenPosition] = useState(initialData?.imagen_position || 'center');
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
    const [tipoEventoId, setTipoEventoId] = useState(initialData?.tipo_evento_id || '');

    useEffect(() => { loadOptions(); }, []);

    useEffect(() => {
        if (initialData) {
            setTitulo(initialData.titulo || '');
            setModalidadId(initialData.modalidad_id || '');
            setFecha(initialData.fecha || '');
            setHora(initialData.hora || '08:30');
            setUbicacion(initialData.ubicacion || '');
            setUbicacionUrl(initialData.ubicacion_url || '');
            setImagenUrl(initialData.imagen_url || '');
            setImagenPosition(initialData.imagen_position || 'center');
            setDescripcion(initialData.descripcion || '');
            setTipoEventoId(initialData.tipo_evento_id || '');
        }
    }, [initialData]);

    async function loadOptions() {
        const supabase = createClient();
        const { data: modalidadesData } = await supabase.from('modalidades').select('*').order('nombre');
        if (modalidadesData) {
            setModalidades(modalidadesData);
            if (modalidadesData.length > 0 && !modalidadId && !isEditing) setModalidadId(modalidadesData[0].id);
        }
        const { data: tiposData } = await supabase.from('tipos_evento').select('*').order('nombre');
        if (tiposData) {
            setTiposEvento(tiposData);
            if (tiposData.length > 0 && !tipoEventoId && !isEditing) setTipoEventoId(tiposData[0].id);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        setUploading(true);
        try {
            const supabase = createClient();
            const { error: uploadError } = await supabase.storage.from('eventos').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('eventos').getPublicUrl(fileName);
            setImagenUrl(publicUrl);
            showToast('Imagen subida correctamente', 'success');
        } catch (error: any) {
            showToast(`Error al subir imagen: ${error.message}`, 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const formData = {
            titulo, modalidad_id: modalidadId, fecha, hora: hora.slice(0, 5),
            ubicacion: ubicacion || null, ubicacion_url: ubicacionUrl || null,
            imagen_url: imagenUrl || null, imagen_position: imagenPosition,
            descripcion: descripcion || null, tipo_evento_id: tipoEventoId || null,
        };

        const validation = eventoCreateSchema.safeParse(formData);
        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                fieldErrors[issue.path[0]?.toString() || 'general'] = issue.message;
            });
            setErrors(fieldErrors);
            showToast('Por favor corrige los errores del formulario', 'error');
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('eventos').update(validation.data).eq('id', initialData.id);
                if (error) throw error;
                showToast('Evento actualizado correctamente', 'success');
            } else {
                const { error } = await supabase.from('eventos').insert(validation.data);
                if (error) throw error;
                showToast('Evento creado correctamente', 'success');
            }
            router.push('/admin');
            router.refresh();
        } catch (err) {
            showToast('Error al guardar el evento', 'error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ═══════ INFORMACIÓN GENERAL ═══════ */}
            <div className="admin-card">
                <div className="admin-card-header blue">
                    <div className="icon-box"><AlignLeft size={16} /></div>
                    <h3>Información General</h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Título */}
                    <div>
                        <label htmlFor="titulo" className="admin-label">
                            Título del evento <span className="required">*</span>
                        </label>
                        <input
                            id="titulo"
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Torneo Apertura 2026"
                            maxLength={120}
                            className={`admin-input ${errors.titulo ? 'error' : ''}`}
                        />
                        {errors.titulo && <p style={{ color: '#D91E18', fontSize: '0.8125rem', marginTop: '0.375rem', fontWeight: 500 }}>{errors.titulo}</p>}
                    </div>

                    {/* Modalidad + Tipo */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {modalidades.length === 0 ? (
                            <div style={{ gridColumn: 'span 2' }}>
                                <SelectEmptyState entityName="modalidades" createHref="/admin/modalidades" />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="modalidad" className="admin-label">
                                    Modalidad <span className="required">*</span>
                                </label>
                                <select
                                    id="modalidad"
                                    value={modalidadId}
                                    onChange={(e) => setModalidadId(e.target.value)}
                                    className={`admin-input ${errors.modalidad_id ? 'error' : ''}`}
                                >
                                    {modalidades.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="tipo" className="admin-label">
                                Tipo de evento <span className="required">*</span>
                            </label>
                            <select
                                id="tipo"
                                value={tipoEventoId}
                                onChange={(e) => setTipoEventoId(e.target.value)}
                                className={`admin-input ${errors.tipo_evento_id ? 'error' : ''}`}
                            >
                                {tiposEvento.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ FECHA Y UBICACIÓN ═══════ */}
            <div className="admin-card">
                <div className="admin-card-header blue">
                    <div className="icon-box"><Calendar size={16} /></div>
                    <h3>Fecha y Ubicación</h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Fecha + Hora */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div>
                            <label htmlFor="fecha" className="admin-label">
                                Fecha <span className="required">*</span>
                            </label>
                            <input
                                id="fecha"
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className={`admin-input ${errors.fecha ? 'error' : ''}`}
                            />
                            {errors.fecha && <p style={{ color: '#D91E18', fontSize: '0.8125rem', marginTop: '0.375rem', fontWeight: 500 }}>{errors.fecha}</p>}
                        </div>
                        <div>
                            <label htmlFor="hora" className="admin-label">Hora</label>
                            <input
                                id="hora"
                                type="time"
                                value={hora}
                                onChange={(e) => setHora(e.target.value)}
                                className="admin-input"
                            />
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div>
                        <label htmlFor="ubicacion" className="admin-label">Ubicación / Polígono</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                            <input
                                id="ubicacion"
                                type="text"
                                value={ubicacion}
                                onChange={(e) => setUbicacion(e.target.value)}
                                placeholder="Ej: COP - Polígono de 10m"
                                className="admin-input"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    {/* Google Maps Link */}
                    <div>
                        <label htmlFor="ubicacion_url" className="admin-label">Link Google Maps</label>
                        <div style={{ position: 'relative' }}>
                            <LinkIcon size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                            <input
                                id="ubicacion_url"
                                type="url"
                                value={ubicacionUrl}
                                onChange={(e) => setUbicacionUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="admin-input"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════ MULTIMEDIA ═══════ */}
            <div className="admin-card">
                <div className="admin-card-header red">
                    <div className="icon-box"><ImageIcon size={16} /></div>
                    <h3>Multimedia</h3>
                </div>
                <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <span className="admin-label">Imagen del Evento</span>

                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Preview */}
                        <div style={{
                            width: '200px', height: '130px',
                            background: 'linear-gradient(135deg, #F9FBFF, #EEF2FF)',
                            borderRadius: '12px', border: '2px dashed rgba(30,58,138,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', position: 'relative', flexShrink: 0,
                            transition: 'all 0.3s ease'
                        }}>
                            {imagenUrl ? (
                                <>
                                    <div style={{
                                        width: '100%', height: '100%',
                                        backgroundImage: `url(${imagenUrl})`,
                                        backgroundSize: 'cover', backgroundRepeat: 'no-repeat',
                                        backgroundPosition: imagenPosition
                                    }} />
                                    <button
                                        type="button"
                                        onClick={() => setImagenUrl('')}
                                        aria-label="Eliminar imagen"
                                        style={{
                                            position: 'absolute', top: '6px', right: '6px',
                                            background: 'rgba(255,255,255,0.95)', border: 'none',
                                            borderRadius: '50%', width: '28px', height: '28px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <ImageIcon size={28} style={{ color: '#94A3B8', marginBottom: '4px' }} />
                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>Sin imagen</p>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
                                Sube una imagen (JPG, PNG) o pega una URL directa.
                            </p>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="btn btn-secondary"
                                style={{ alignSelf: 'flex-start' }}
                            >
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                                Subir Archivo
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                aria-label="Subir archivo de imagen"
                            />

                            {/* Position buttons */}
                            {imagenUrl && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #F9FBFF, #F1F5FF)',
                                    padding: '0.875rem', borderRadius: '10px',
                                    border: '1px solid rgba(30,58,138,0.1)'
                                }}>
                                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                                        Ajustar Enfoque
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                                        {(['top', 'center', 'bottom', 'left', 'right'] as const).map(pos => (
                                            <button
                                                key={pos}
                                                type="button"
                                                onClick={() => setImagenPosition(pos)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    borderRadius: '8px',
                                                    border: imagenPosition === pos ? '1.5px solid #1E3A8A' : '1.5px solid rgba(30,58,138,0.15)',
                                                    background: imagenPosition === pos ? '#1E3A8A' : 'white',
                                                    color: imagenPosition === pos ? 'white' : '#475569',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    boxShadow: imagenPosition === pos ? '0 2px 8px rgba(30,58,138,0.3)' : 'none'
                                                }}
                                            >
                                                {pos === 'top' ? 'Arriba' : pos === 'center' ? 'Centro' : pos === 'bottom' ? 'Abajo' : pos === 'left' ? 'Izq' : 'Der'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(30,58,138,0.1)' }} />
                                <span style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>O usa URL</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(30,58,138,0.1)' }} />
                            </div>

                            <div style={{ position: 'relative' }}>
                                <LinkIcon size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
                                <input
                                    type="url"
                                    value={imagenUrl}
                                    onChange={(e) => setImagenUrl(e.target.value)}
                                    placeholder="https://pagina.com/imagen.jpg"
                                    className="admin-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    aria-label="URL de la imagen"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label htmlFor="descripcion" className="admin-label">Descripción Adicional</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={4}
                            className="admin-input"
                            placeholder="Detalles sobre inscripciones, requisitos, etc..."
                        />
                    </div>
                </div>
            </div>

            {/* ═══════ ACTIONS ═══════ */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <Link href="/admin" className="btn btn-secondary">
                    Cancelar
                </Link>
                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="btn btn-primary"
                >
                    {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                    ) : (
                        <><Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Crear Evento'}</>
                    )}
                </button>
            </div>
        </form>
    );
}
