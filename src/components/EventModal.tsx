'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock, MapPin, Map, X, Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface EventModalProps {
    evento: EventoConModalidad | null;
    onClose: () => void;
}

export default function EventModal({ evento, onClose }: EventModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (evento) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [evento]);

    if (!mounted || !evento) return null;

    const fecha = new Date(evento.fecha + 'T12:00:00');
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    const anio = fecha.getFullYear();

    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#737373';

    const modalContent = (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease-out'
        }} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(255,255,255,0.8)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        color: '#404040'
                    }}
                >
                    <X size={18} />
                </button>

                {evento.imagen_url && (
                    <div style={{
                        width: '100%',
                        background: '#f5f5f5',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <img
                            src={evento.imagen_url}
                            alt={evento.titulo}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                        />
                    </div>
                )}

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: evento.modalidades?.color || '#171717',
                            background: `${evento.modalidades?.color}15`,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '100px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: evento.modalidades?.color }} />
                            {evento.modalidades?.nombre}
                        </span>
                        {tipoNombre && (
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: tipoColor,
                                border: `1px solid ${tipoColor}30`,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px'
                            }}>
                                {tipoNombre}
                            </span>
                        )}
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#171717',
                        marginBottom: '1rem',
                        lineHeight: 1.2
                    }}>
                        {evento.titulo}
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#525252' }}>
                            <CalendarIcon size={18} />
                            <span style={{ textTransform: 'capitalize' }}>
                                {diaSemana}, {dia} de {mes} {anio}
                            </span>
                        </div>
                        {evento.hora && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#525252' }}>
                                <Clock size={18} />
                                <span>{evento.hora.slice(0, 5)} hs</span>
                            </div>
                        )}
                        {evento.ubicacion && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#525252' }}>
                                <MapPin size={18} />
                                <span>{evento.ubicacion}</span>
                            </div>
                        )}
                    </div>

                    {evento.descripcion && (
                        <div style={{
                            background: '#F9FAFB',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            color: '#404040',
                            lineHeight: 1.6,
                            fontSize: '0.9375rem'
                        }}>
                            {evento.descripcion}
                        </div>
                    )}

                    {evento.ubicacion_url && (
                        <a
                            href={evento.ubicacion_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                width: '100%',
                                padding: '0.75rem',
                                background: '#171717',
                                color: '#fff',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: 500,
                                transition: 'opacity 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            <Map size={18} />
                            Ver ubicación en Google Maps
                        </a>
                    )}
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
}
