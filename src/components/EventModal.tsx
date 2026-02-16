'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock, MapPin, Map, X, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

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

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        setMounted(true);
        if (evento) {
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [evento, handleEscape]);

    if (!mounted || !evento) return null;

    const fecha = new Date(evento.fecha + 'T12:00:00');
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const anio = fecha.getFullYear();

    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#94A3B8';

    const hasValidImage = !!evento.imagen_url && isValidImageUrl(evento.imagen_url);

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-overlay-in"
            style={{
                background: 'rgba(30, 58, 138, 0.15)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
        >
            <div
                className="bg-surface rounded-elite-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-elite-xl relative animate-dialog-in"
            >
                <button
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 border border-border-elite text-text-secondary cursor-pointer shadow-elite-xs transition-all duration-150 hover:bg-surface hover:shadow-elite-sm hover:text-text-elite active:scale-95"
                >
                    <X size={18} />
                </button>

                {hasValidImage && (
                    <div className="w-full bg-bg-elite flex justify-center items-center border-b border-border-elite">
                        <img
                            src={evento.imagen_url!}
                            alt={evento.titulo}
                            className="max-w-full max-h-[300px] object-contain block"
                        />
                    </div>
                )}

                <div className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                        {evento.modalidades && (
                            <span
                                className="text-xs font-semibold py-1 px-2.5 rounded-full inline-flex items-center gap-1"
                                style={{
                                    color: evento.modalidades.color,
                                    background: `${evento.modalidades.color}15`,
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: evento.modalidades.color }} />
                                {evento.modalidades.nombre}
                            </span>
                        )}
                        {tipoNombre && (
                            <span
                                className="text-xs font-medium py-0.5 px-2 rounded"
                                style={{
                                    color: tipoColor,
                                    border: `1px solid ${tipoColor}30`,
                                }}
                            >
                                {tipoNombre}
                            </span>
                        )}
                    </div>

                    <h2
                        id="event-modal-title"
                        className="text-2xl font-bold text-text-elite mb-4 leading-tight tracking-[-0.02em]"
                    >
                        {evento.titulo}
                    </h2>

                    <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-3 text-text-secondary">
                            <CalendarIcon size={18} />
                            <span className="capitalize">
                                {diaSemana}, {dia} de {mes} {anio}
                            </span>
                        </div>
                        {evento.hora && (
                            <div className="flex items-center gap-3 text-text-secondary">
                                <Clock size={18} />
                                <span>{evento.hora.slice(0, 5)} hs</span>
                            </div>
                        )}
                        {evento.ubicacion && (
                            <div className="flex items-center gap-3 text-text-secondary">
                                <MapPin size={18} />
                                <span>{evento.ubicacion}</span>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div className="bg-bg-elite p-4 rounded-elite-sm mb-6 text-text-secondary leading-relaxed text-[0.9375rem]">
                            {evento.descripcion}
                        </div>
                    )}

                    {evento.ubicacion_url && (
                        <a
                            href={evento.ubicacion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-cop-blue text-white rounded-elite-sm no-underline font-medium transition-all duration-250 hover:bg-cop-blue/90 hover:shadow-elite-md active:scale-[0.97]"
                        >
                            <Map size={18} />
                            Ver ubicación en Google Maps
                        </a>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
