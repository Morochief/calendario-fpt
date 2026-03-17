'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { ImagenEvento } from '@/lib/types';
import { Image as ImageIcon, X, Plus, UploadCloud, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventImageUploadProps {
    eventoId?: string; // Optional for new events (creation flow)
    onImagesChange?: (files: File[]) => void;
    className?: string;
}

export default function EventImageUpload({ eventoId, onImagesChange, className }: EventImageUploadProps) {
    const [imagenes, setImagenes] = useState<ImagenEvento[]>([]);
    const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [loading, setLoading] = useState(!!eventoId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (eventoId) {
            loadImagenes();
        } else {
            setLoading(false);
        }
    }, [eventoId]);

    async function loadImagenes() {
        const supabase = createClient();
        const { data } = await supabase
            .from('imagenes_evento')
            .select('*')
            .eq('evento_id', eventoId)
            .order('orden', { ascending: true });
        setImagenes(data || []);
        setLoading(false);
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const files = Array.from(e.target.files);
        
        if (eventoId) {
            // Edit mode: Upload directly
            handleUpload(files);
        } else {
            // Creation mode: Add to pending
            const newPending = files.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            const updatedPending = [...pendingFiles, ...newPending];
            setPendingFiles(updatedPending);
            if (onImagesChange) onImagesChange(updatedPending.map(p => p.file));
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    async function handleUpload(files: File[]) {
        setUploading(true);
        const supabase = createClient();
        const maxOrden = imagenes.length > 0 ? Math.max(...imagenes.map(i => i.orden)) : 0;

        for (let idx = 0; idx < files.length; idx++) {
            const file = files[idx];
            const ext = file.name.split('.').pop();
            const fileName = `gallery_${eventoId}_${Date.now()}_${idx}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('event-images')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Error subiendo imagen:', uploadError);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('event-images')
                .getPublicUrl(fileName);

            await supabase.from('imagenes_evento').insert({
                evento_id: eventoId,
                url: publicUrl,
                descripcion: null,
                orden: maxOrden + idx + 1,
            });
        }

        await loadImagenes();
        setUploading(false);
    }

    async function handleDelete(imagen: ImagenEvento) {
        setDeleting(imagen.id);
        const supabase = createClient();

        const urlParts = imagen.url.split('/event-images/');
        if (urlParts.length === 2) {
            await supabase.storage.from('event-images').remove([urlParts[1]]);
        }

        await supabase.from('imagenes_evento').delete().eq('id', imagen.id);
        await loadImagenes();
        setDeleting(null);
    }

    const removePending = (index: number) => {
        const updated = pendingFiles.filter((_, i) => i !== index);
        setPendingFiles(updated);
        if (onImagesChange) onImagesChange(updated.map(p => p.file));
    };

    if (loading) return (
        <div className="flex items-center justify-center p-8 animate-pulse">
            <Loader2 className="w-6 h-6 text-cop-blue animate-spin" />
            <span className="ml-3 text-sm font-bold text-cop-blue/60 uppercase tracking-widest">Cargando Galería...</span>
        </div>
    );

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cop-blue/10 flex items-center justify-center text-cop-blue shadow-inner border border-cop-blue/5">
                        <ImageIcon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-cop-blue tracking-tight leading-none uppercase">Galería del Evento</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Múltiples fotos y material de cobertura</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cop-blue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />}
                    Agregar Imágenes
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Empty State */}
            {imagenes.length === 0 && pendingFiles.length === 0 && (
                <div className="p-12 border-4 border-dashed border-slate-50 rounded-[2rem] bg-slate-50/30 flex flex-col items-center justify-center text-slate-300 gap-4 group hover:bg-slate-50/50 transition-colors duration-500">
                    <UploadCloud size={64} strokeWidth={1} className="group-hover:text-cop-blue/20 transition-colors" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No hay imágenes en la galería</p>
                        <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest mt-1">Haz clic en "Agregar Imágenes" para subir contenido</p>
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {(imagenes.length > 0 || pendingFiles.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Existing Images */}
                    {imagenes.map((img) => (
                        <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm hover:shadow-md transition-all">
                            <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(img)}
                                    disabled={deleting === img.id}
                                    className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-fpt-red hover:border-fpt-red transition-all"
                                >
                                    {deleting === img.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pending Files */}
                    {pendingFiles.map((pf, idx) => (
                        <div key={`pending-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-cop-blue/30 bg-cop-blue/5 shadow-sm transition-all">
                            <img src={pf.preview} alt="" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                                <span className="px-2 py-1 bg-cop-blue text-white text-[8px] font-black uppercase tracking-tighter rounded-md mb-2 shadow-sm">Pendiente</span>
                                <button
                                    type="button"
                                    onClick={() => removePending(idx)}
                                    className="p-2 rounded-xl bg-white border border-slate-100 text-fpt-red hover:bg-fpt-red hover:text-white transition-all shadow-sm"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!eventoId && pendingFiles.length > 0 && (
                <div className="flex items-center gap-3 p-4 bg-cop-blue/5 border border-cop-blue/10 rounded-2xl animate-in fade-in slide-in-from-left-4">
                    <div className="w-8 h-8 rounded-xl bg-cop-blue/10 flex items-center justify-center text-cop-blue">
                        <Info size={16} />
                    </div>
                    <p className="text-[11px] font-bold text-cop-blue/70 uppercase tracking-wider leading-relaxed">
                        Las imágenes marcadas como <span className="text-cop-blue font-black underline underline-offset-2">pendientes</span> se subirán automáticamente cuando publiques el evento.
                    </p>
                </div>
            )}
        </div>
    );
}
