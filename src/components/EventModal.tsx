'use client';

import { EventoConModalidad, ImagenEvento } from '@/lib/types';
import { Clock, MapPin, Map, X, Calendar as CalendarIcon, Building2, ExternalLink, ChevronLeft, ChevronRight, Maximize2, ImageIcon } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface EventModalProps {
    evento: EventoConModalidad | null;
    onClose: () => void;
}

function isValidImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function EventModal({ evento, onClose }: EventModalProps) {
    const [mounted, setMounted] = useState(false);
    const [imagenes, setImagenes] = useState<ImagenEvento[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [loadingGallery, setLoadingGallery] = useState(true);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (showLightbox) setShowLightbox(false);
            else onClose();
        }
        if (showLightbox) {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        }
    }, [onClose, showLightbox]);

    useEffect(() => {
        setMounted(true);
        if (evento) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
            loadGallery();
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [evento, handleEscape]);

    async function loadGallery() {
        if (!evento) return;
        setLoadingGallery(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('imagenes_evento')
            .select('*')
            .eq('evento_id', evento.id)
            .order('orden', { ascending: true });
        setImagenes(data || []);
        setLoadingGallery(false);
    }

    const handleNext = () => {
        if (imagenes.length === 0) return;
        setCurrentIdx((prev: number) => (prev + 1) % imagenes.length);
    };
    
    const handlePrev = () => {
        if (imagenes.length === 0) return;
        setCurrentIdx((prev: number) => (prev - 1 + imagenes.length) % imagenes.length);
    };

    if (!mounted || !evento) return null;

    const fecha = new Date(evento.fecha + 'T12:00:00');
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const anio = fecha.getFullYear();

    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#94A3B8';
    const modalityColor = evento.modalidades?.color || '#1E3A8A';

    const hasValidImage = !!evento.imagen_url && isValidImageUrl(evento.imagen_url);

    return createPortal(
        <div
            onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.2s ease',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 24px 80px rgba(30, 58, 138, 0.2), 0 8px 24px rgba(0,0,0,0.1)',
                    position: 'relative',
                    animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
                        width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', border: '1.5px solid rgba(30,58,138,0.15)',
                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                        color: '#475569', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#D91E18';
                        e.currentTarget.style.borderColor = '#D91E18';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.borderColor = 'rgba(30,58,138,0.15)';
                    }}
                >
                    <X size={18} />
                </button>

                {/* Main Visual Header (Carousel or Single Image) */}
                <div style={{
                    width: '100%',
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, #F9FBFF, #EEF2FF)',
                    borderBottom: '1.5px solid rgba(30,58,138,0.1)',
                    borderRadius: '20px 20px 0 0',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {imagenes.length > 0 ? (
                        <div className="w-full h-full relative group/carousel">
                            {/* Ken Burns Active Image */}
                            <div className="w-full h-full overflow-hidden">
                                <img
                                    key={imagenes[currentIdx].id}
                                    src={imagenes[currentIdx].url}
                                    alt=""
                                    className="w-full h-full object-cover animate-ken-burns transition-opacity duration-700"
                                />
                            </div>

                            {/* Carousel Controls */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
                                <button 
                                    onClick={handlePrev}
                                    className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-cop-blue hover:bg-white transition-all shadow-lg"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-cop-blue hover:bg-white transition-all shadow-lg"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Expand View Button */}
                            <button 
                                onClick={() => setShowLightbox(true)}
                                className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/40 backdrop-blur-md border border-white/30 text-cop-blue opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg"
                            >
                                <Maximize2 size={14} />
                                <span>Galería Inmersiva</span>
                            </button>

                            {/* Pagination Dots */}
                            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
                                {imagenes.map((_: ImagenEvento, i: number) => (
                                    <div 
                                        key={i} 
                                        className={cn(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === currentIdx ? "w-6 bg-cop-blue" : "w-1.5 bg-cop-blue/20"
                                        )} 
                                    />
                                ))}
                            </div>
                        </div>
                    ) : hasValidImage ? (
                        <img
                            src={evento.imagen_url!}
                            alt={evento.titulo}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                            <ImageIcon size={48} strokeWidth={1} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Sin Cobertura Visual</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {evento.modalidades && (
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                padding: '0.375rem 0.75rem', borderRadius: '100px',
                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                color: modalityColor,
                                background: `${modalityColor}12`,
                                border: `1px solid ${modalityColor}25`,
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: modalityColor }} />
                                {evento.modalidades.nombre}
                            </span>
                        )}
                        {tipoNombre && (
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 600,
                                padding: '0.25rem 0.625rem', borderRadius: '6px',
                                color: tipoColor,
                                border: `1.5px solid ${tipoColor}30`,
                                background: `${tipoColor}08`,
                            }}>
                                {tipoNombre}
                            </span>
                        )}
                        {evento.estado_override && (
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase',
                                padding: '0.25rem 0.625rem', borderRadius: '6px',
                                color: evento.estado_override === 'cancelado' ? '#DC2626' :
                                    evento.estado_override === 'suspendido' ? '#EA580C' : '#CA8A04',
                                border: `1.5px solid ${evento.estado_override === 'cancelado' ? '#DC2626' :
                                    evento.estado_override === 'suspendido' ? '#EA580C' : '#CA8A04'
                                    }30`,
                                background: `${evento.estado_override === 'cancelado' ? '#DC2626' :
                                    evento.estado_override === 'suspendido' ? '#EA580C' : '#CA8A04'
                                    }08`,
                            }}>
                                {evento.estado_override}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2
                        id="event-modal-title"
                        style={{
                            fontSize: '1.5rem', fontWeight: 700,
                            color: '#1E3A8A', marginBottom: '1.25rem',
                            lineHeight: 1.3, letterSpacing: '-0.02em',
                        }}
                    >
                        {evento.titulo}
                    </h2>

                    {/* Info items */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #F9FBFF, #F1F5FF)',
                        borderRadius: '12px',
                        border: '1px solid rgba(30,58,138,0.08)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'rgba(30,58,138,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <CalendarIcon size={16} style={{ color: '#1E3A8A' }} />
                            </div>
                            <span style={{ color: '#475569', fontSize: '0.9375rem', textTransform: 'capitalize' }}>
                                {diaSemana}, {dia} De {mes.charAt(0).toUpperCase() + mes.slice(1)} {anio}
                            </span>
                        </div>

                        {evento.hora && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(30,58,138,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Clock size={16} style={{ color: '#1E3A8A' }} />
                                </div>
                                <span style={{ color: '#475569', fontSize: '0.9375rem' }}>
                                    {evento.hora.slice(0, 5)} hs
                                </span>
                            </div>
                        )}

                        {evento.ubicacion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: 'rgba(30,58,138,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <MapPin size={16} style={{ color: '#1E3A8A' }} />
                                </div>
                                <span style={{ color: '#475569', fontSize: '0.9375rem' }}>
                                    {evento.ubicacion}
                                </span>
                            </div>
                        )}

                        {evento.clubes && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: `${evento.clubes.color || '#1E3A8A'}12`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Building2 size={16} style={{ color: evento.clubes.color || '#1E3A8A' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: evento.clubes.color || '#475569', fontSize: '0.9375rem', fontWeight: 500 }}>
                                        {evento.clubes.nombre}
                                    </span>
                                    {evento.clubes.website_url && (
                                        <a
                                            href={evento.clubes.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                fontSize: '0.75rem',
                                                color: '#3B82F6',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                marginTop: '0.125rem'
                                            }}
                                            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.textDecoration = 'none'}
                                        >
                                            Visitar sitio web <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {evento.descripcion && (
                        <div style={{
                            padding: '1rem',
                            background: '#F9FBFF',
                            borderRadius: '12px',
                            border: '1px solid rgba(30,58,138,0.08)',
                            marginBottom: '1.5rem',
                            color: '#475569',
                            lineHeight: 1.7,
                            fontSize: '0.9375rem',
                            whiteSpace: 'pre-line',
                        }}>
                            {evento.descripcion}
                        </div>
                    )}

                    {/* Maps button */}
                    {evento.ubicacion_url && (
                        <a
                            href={evento.ubicacion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-blue"
                            style={{
                                width: '100%', padding: '0.875rem',
                                borderRadius: '12px', justifyContent: 'center',
                            }}
                        >
                            <Map size={18} />
                            Ver ubicación en Google Maps
                        </a>
                    )}
                </div>
            </div>

            {/* Elite Lightbox / Immersive Gallery */}
            {showLightbox && imagenes.length > 0 && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-3xl animate-fade-in">
                    {/* Adaptive Blurred Background */}
                    <div className="absolute inset-0 opacity-40">
                        <img 
                            src={imagenes[currentIdx].url} 
                            alt="" 
                            className="w-full h-full object-cover blur-[100px] scale-110 transition-all duration-1000"
                        />
                    </div>

                    <button 
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-8 right-8 p-4 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black transition-all z-20 group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="relative w-full h-full flex flex-col items-center justify-center px-4 md:px-20 py-20 pointer-events-none">
                        <div className="relative w-full h-full max-w-6xl pointer-events-auto flex items-center justify-center animate-scale-up">
                            {/* Main Active Image */}
                            <img 
                                src={imagenes[currentIdx].url} 
                                alt="" 
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                            />

                            {/* Controls */}
                            <button 
                                onClick={handlePrev}
                                className="absolute left-0 -translate-x-1/2 md:-translate-x-full p-6 text-white/40 hover:text-white transition-all outline-none"
                            >
                                <ChevronLeft size={64} strokeWidth={1} />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="absolute right-0 translate-x-1/2 md:translate-x-full p-6 text-white/40 hover:text-white transition-all outline-none"
                            >
                                <ChevronRight size={64} strokeWidth={1} />
                            </button>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-auto max-w-[90vw] overflow-x-auto no-scrollbar scroll-smooth animate-slide-up">
                            {imagenes.map((img: ImagenEvento, i: number) => (
                                <button
                                    key={img.id}
                                    onClick={() => setCurrentIdx(i)}
                                    className={cn(
                                        "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 group",
                                        i === currentIdx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
                                    )}
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                </button>
                            ))}
                        </div>

                        {/* Caption */}
                        {imagenes[currentIdx].descripcion && (
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/80 font-medium text-lg bg-black/40 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
                                {imagenes[currentIdx].descripcion}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { 
                    from { opacity: 0; transform: scale(0.95) translateY(10px); } 
                    to { opacity: 1; transform: scale(1) translateY(0); } 
                }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                
                @keyframes ken-burns {
                    0% { transform: scale(1) translate(0, 0); }
                    100% { transform: scale(1.05) translate(-1%, -0.5%); }
                }

                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-ken-burns { animation: ken-burns 10s ease-in-out infinite alternate; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>,
        document.body
    );
}
