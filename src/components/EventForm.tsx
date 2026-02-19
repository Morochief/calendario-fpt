'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { SelectEmptyState } from '@/components/EmptyState';
import { createClient } from '@/lib/supabase';
import { Modalidad, TipoEvento, Club } from '@/lib/types';
import { eventoCreateSchema, EventoInput } from '@/lib/schemas';
import { Save, X, Calendar, MapPin, Link as LinkIcon, Image as ImageIcon, AlignLeft, UploadCloud, Loader2, Building2, Tag, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import EliteButton from '@/components/ui/EliteButton';
import EliteSelect from '@/components/ui/EliteSelect';

interface EventFormProps {
    initialData?: Partial<EventoInput> & { id?: string };
    isEditing?: boolean;
}

export default function EventForm({ initialData, isEditing = false }: EventFormProps) {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
    const [clubes, setClubes] = useState<Club[]>([]);
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
    const [clubId, setClubId] = useState(initialData?.club_id || '');
    const [estadoOverride, setEstadoOverride] = useState(initialData?.estado_override || '');

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
            setClubId(initialData.club_id || '');
            setEstadoOverride(initialData.estado_override || '');
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
        const { data: clubesData } = await supabase.from('clubes').select('*').eq('estado', 'afederado').order('nombre');
        if (clubesData) setClubes(clubesData);
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            club_id: clubId || null,
            estado_override: estadoOverride || null,
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

            {/* ═══════ CLUSTER 1: IDENTIDAD ═══════ */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-fpt-red/10 flex items-center justify-center text-fpt-red shadow-inner border border-fpt-red/5">
                        <AlignLeft size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cop-blue tracking-tight leading-none uppercase">Identidad del Evento</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Definición y categorización oficial</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Título */}
                    <div className="md:col-span-2 group">
                        <label htmlFor="titulo" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 transition-colors group-focus-within:text-cop-blue uppercase tracking-wider">
                            Título del evento <span className="text-fpt-red font-black">*</span>
                        </label>
                        <input
                            id="titulo"
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Torneo Apertura 2026"
                            maxLength={120}
                            className={cn(
                                "w-full px-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent",
                                "text-slate-800 font-semibold placeholder:text-slate-300 placeholder:font-medium",
                                "transition-all duration-300 focus:bg-white focus:border-cop-blue/20 focus:shadow-lg focus:shadow-blue-900/5 outline-none",
                                errors.titulo && "border-fpt-red/30 bg-fpt-red-[4px]"
                            )}
                        />
                        {errors.titulo && <p className="text-fpt-red text-[11px] font-bold mt-2 ml-1 uppercase tracking-tight">{errors.titulo}</p>}
                    </div>

                    {/* Modalidad */}
                    <div className="group">
                        <label htmlFor="modalidad" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 transition-colors group-focus-within:text-cop-blue">
                            Modalidad <span className="text-fpt-red">*</span>
                        </label>
                        {modalidades.length === 0 ? (
                            <SelectEmptyState entityName="modalidades" createHref="/admin/modalidades" />
                        ) : (
                            <EliteSelect
                                label="Modalidad"
                                value={modalidadId}
                                onChange={setModalidadId}
                                options={modalidades.map(m => ({
                                    value: m.id,
                                    label: m.nombre,
                                    color: m.color
                                }))}
                                error={errors.modalidad_id}
                                placeholder="Seleccionar modalidad"
                                icon={AlignLeft}
                            />
                        )}
                    </div>

                    {/* Tipo */}
                    <div className="group">
                        <label htmlFor="tipo" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 transition-colors group-focus-within:text-cop-blue uppercase tracking-wider">
                            Tipo de evento <span className="text-fpt-red font-black">*</span>
                        </label>
                        <EliteSelect
                            label="Tipo de Evento"
                            value={tipoEventoId}
                            onChange={setTipoEventoId}
                            options={tiposEvento.map(t => ({
                                value: t.id,
                                label: t.nombre
                            }))}
                            error={errors.tipo_evento_id}
                            placeholder="Seleccionar tipo"
                            icon={Tag}
                        />
                    </div>

                    {/* Estado Override */}
                    <div className="group">
                        <label htmlFor="estado_override" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 transition-colors group-focus-within:text-cop-blue uppercase tracking-wider">
                            Estado (Manual) <span className="text-slate-400 font-normal lowercase tracking-normal">(Opcional)</span>
                        </label>
                        <EliteSelect
                            label="Estado Manual"
                            value={estadoOverride}
                            onChange={setEstadoOverride}
                            options={[
                                { value: '', label: 'Automático (Por Fecha)' },
                                { value: 'cancelado', label: 'Cancelado' },
                                { value: 'suspendido', label: 'Suspendido' },
                                { value: 'postpuesto', label: 'Postpuesto' }
                            ]}
                            placeholder="Seleccionar estado"
                            icon={Tag}
                        />
                    </div>

                    {/* Club Organizador */}
                    {clubes.length > 0 && (
                        <div className="md:col-span-2 group">
                            <label htmlFor="club" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 transition-colors group-focus-within:text-cop-blue uppercase tracking-wider">
                                <Building2 size={14} className="inline mr-1 -mt-0.5" /> Club Organizador
                            </label>
                            <EliteSelect
                                label="Club Organizador"
                                value={clubId}
                                onChange={setClubId}
                                options={[
                                    { value: '', label: '— Sin club asignado —' },
                                    ...clubes.map(c => ({
                                        value: c.id,
                                        label: `${c.nombre} (${c.siglas})`
                                    }))
                                ]}
                                placeholder="Seleccionar club"
                                icon={Building2}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════ CLUSTER 2: LOGÍSTICA ═══════ */}
            <section className="bg-slate-50/80 p-6 sm:p-8 rounded-[2rem] border border-slate-200/50 shadow-inner space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 border-b border-white pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cop-blue/10 flex items-center justify-center text-cop-blue shadow-inner border border-cop-blue/5">
                        <Calendar size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cop-blue tracking-tight leading-none uppercase">Fecha y Ubicación</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Coordenadas y cronograma del evento</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Fecha */}
                    <div className="group">
                        <label htmlFor="fecha" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1">
                            Fecha <span className="text-fpt-red">*</span>
                        </label>
                        <input
                            id="fecha"
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className={cn(
                                "w-full px-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent outline-none",
                                "text-slate-800 font-bold transition-all duration-300 focus:bg-white focus:border-cop-blue/20",
                                errors.fecha && "border-fpt-red/30"
                            )}
                        />
                        {errors.fecha && <p className="text-fpt-red text-[11px] font-bold mt-2 ml-1 uppercase tracking-tight">{errors.fecha}</p>}
                    </div>

                    {/* Hora */}
                    <div className="group">
                        <label htmlFor="hora" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1">Hora</label>
                        <input
                            id="hora"
                            type="time"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent outline-none text-slate-800 font-bold transition-all duration-300 focus:bg-white focus:border-cop-blue/20"
                        />
                    </div>

                    {/* Ubicación */}
                    <div className="group">
                        <label htmlFor="ubicacion" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 uppercase tracking-wider">Ubicación / Polígono</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                id="ubicacion"
                                type="text"
                                value={ubicacion}
                                onChange={(e) => setUbicacion(e.target.value)}
                                placeholder="Ej: COP - Polígono de 10m"
                                className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent outline-none text-slate-800 font-semibold transition-all duration-300 focus:bg-white focus:border-cop-blue/20"
                            />
                        </div>
                    </div>

                    {/* Google Maps Link */}
                    <div className="group">
                        <label htmlFor="ubicacion_url" className="block text-sm font-bold text-cop-blue/70 mb-2 ml-1 uppercase tracking-wider">Link Google Maps</label>
                        <div className="relative">
                            <LinkIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                id="ubicacion_url"
                                type="url"
                                value={ubicacionUrl}
                                onChange={(e) => setUbicacionUrl(e.target.value)}
                                placeholder="https://maps.app.goo.gl/..."
                                className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50 border-2 border-transparent outline-none text-slate-800 font-semibold transition-all duration-300 focus:bg-white focus:border-cop-blue/20"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CLUSTER 3: IMPACTO VISUAL ═══════ */}
            <section className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-fpt-red/10 flex items-center justify-center text-fpt-red shadow-inner border border-fpt-red/5">
                        <ImageIcon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cop-blue tracking-tight leading-none uppercase">Presencia Visual</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Material multimedia y flyer oficial</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-5 flex flex-col items-center gap-6">
                        <div className={cn(
                            "w-full aspect-video rounded-3xl border-4 border-dashed transition-all duration-500 overflow-hidden relative group/img",
                            imagenUrl ? "border-cop-blue/10 shadow-elite-md" : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-200"
                        )}>
                            {imagenUrl ? (
                                <>
                                    <div
                                        className="w-full h-full bg-cover bg-no-repeat transition-transform duration-700 group-hover/img:scale-110"
                                        style={{ backgroundImage: `url(${imagenUrl})`, backgroundPosition: imagenPosition }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => setImagenUrl('')}
                                            className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-fpt-red hover:border-fpt-red transition-all"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-3">
                                    <ImageIcon size={64} strokeWidth={1} />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Sin Imagen</span>
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 size={32} className="text-cop-blue animate-spin" />
                                        <span className="text-xs font-bold text-cop-blue tracking-widest uppercase">Subiendo archivo...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-8">
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Mejora el impacto visual de tu evento seleccionando una imagen institucional o un flyer oficial.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <EliteButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => fileInputRef.current?.click()}
                                    isLoading={uploading}
                                    icon={<UploadCloud size={18} />}
                                    className="px-6 py-6 rounded-2xl border-2"
                                >
                                    Elegir Archivo
                                </EliteButton>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {imagenUrl && (
                            <div className="p-6 rounded-3xl bg-cop-blue/5 border border-cop-blue/10 animate-fade-in group">
                                <span className="block text-[11px] font-black text-cop-blue/60 uppercase tracking-widest mb-4">Ajustar Enfoque Visual</span>
                                <div className="flex flex-wrap gap-2">
                                    {(['top', 'center', 'bottom', 'left', 'right'] as const).map(pos => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setImagenPosition(pos)}
                                            className={cn(
                                                "px-4 py-2 text-xs font-extrabold rounded-xl transition-all border-2",
                                                imagenPosition === pos
                                                    ? "bg-cop-blue border-cop-blue text-white shadow-btn-blue shadow-blue-900/40 translate-y-[-2px]"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-cop-blue/30 hover:text-cop-blue"
                                            )}
                                        >
                                            {pos === 'top' ? 'Superior' : pos === 'center' ? 'Central' : pos === 'bottom' ? 'Inferior' : pos === 'left' ? 'Izquierda' : 'Derecha'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-grow h-px bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">O Vincular URL</span>
                                <div className="flex-grow h-px bg-slate-100" />
                            </div>

                            <div className="relative group/url">
                                <LinkIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/url:text-cop-blue transition-colors pointer-events-none" />
                                <input
                                    type="url"
                                    value={imagenUrl}
                                    onChange={(e) => setImagenUrl(e.target.value)}
                                    placeholder="https://pagina.com/flyer-oficial.jpg"
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent outline-none text-sm font-semibold transition-all focus:bg-white focus:border-cop-blue/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CLUSTER 4: OBSERVACIONES ═══════ */}
            <section className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-200/60 shadow-inner space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex items-center gap-4 border-b border-white pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-cop-blue/10 flex items-center justify-center text-cop-blue shadow-inner border border-cop-blue/5">
                        <FileText size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cop-blue tracking-tight leading-none uppercase">Observaciones</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Información adicional y reglamentos específicos</p>
                    </div>
                </div>

                <div className="group">
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Detalla aquí información relevante como requisitos de inscripción, vestimenta o aclaraciones técnicas..."
                        rows={5}
                        className={cn(
                            "w-full px-6 py-5 rounded-3xl bg-white border-2 border-slate-100 outline-none text-slate-700 font-medium",
                            "transition-all duration-300 focus:border-cop-blue/20 focus:shadow-xl focus:shadow-blue-900/5 placeholder:text-slate-300"
                        )}
                    />
                </div>
            </section>

            {/* ═══════ ACTIONS ═══════ */}
            <div className="flex items-center justify-end gap-6 pt-10 pb-4">
                <Link
                    href="/admin"
                    className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-fpt-red hover:bg-fpt-red/5 transition-all uppercase text-[10px] tracking-[0.2em] border border-transparent hover:border-fpt-red/10"
                >
                    Descartar Cambios
                </Link>
                <EliteButton
                    type="submit"
                    isLoading={loading}
                    icon={<Save size={20} />}
                    className="px-12 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20"
                >
                    {isEditing ? 'Actualizar Evento' : 'Publicar Competencia'}
                </EliteButton>
            </div>
        </form>
    );
}
