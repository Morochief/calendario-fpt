'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock, MapPin, Map, X, Calendar as CalendarIcon, Building2, ExternalLink } from 'lucide-react';
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
    const modalityColor = evento.modalidades?.color || '#1E3A8A';

    const hasValidImage = !!evento.imagen_url && isValidImageUrl(evento.imagen_url);

    return createPortal(
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.color = '#D91E18';
                        e.currentTarget.style.borderColor = '#D91E18';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.borderColor = 'rgba(30,58,138,0.15)';
                    }}
                >
                    <X size={18} />
                </button>

                {/* Image */}
                {hasValidImage && (
                    <div style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #F9FBFF, #EEF2FF)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        borderBottom: '1.5px solid rgba(30,58,138,0.1)',
                        borderRadius: '20px 20px 0 0',
                        overflow: 'hidden',
                    }}>
                        <img
                            src={evento.imagen_url!}
                            alt={evento.titulo}
                            style={{
                                maxWidth: '100%', maxHeight: '300px',
                                objectFit: 'contain', display: 'block',
                            }}
                        />
                    </div>
                )}

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
                                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
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

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
}
