'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock, MapPin, Map } from 'lucide-react';

interface EventCardProps {
    evento: EventoConModalidad;
}

export default function EventCard({ evento }: EventCardProps) {
    const fecha = new Date(evento.fecha + 'T12:00:00');
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });

    // Usar tipos_evento si existe, sino fallback al campo tipo
    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#6B7280';
    const hasImage = !!evento.imagen_url;

    return (
        <div
            className={`event-card ${hasImage ? 'has-image' : ''}`}
            style={{
                borderLeftColor: evento.modalidades?.color || '#DC2626',
            }}
        >
            {hasImage && (
                <div
                    className="event-hero-image"
                    style={{
                        backgroundImage: `url(${evento.imagen_url})`,
                        height: '140px',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%'
                    }}
                />
            )}

            <div className="event-content" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div className="event-date">
                        {diaSemana}, {dia} de {mes}
                    </div>
                </div>

                <div className="event-title">{evento.titulo}</div>

                <div className="event-meta">
                    {evento.hora && (
                        <span><Clock size={14} /> {evento.hora.slice(0, 5)}</span>
                    )}

                    {tipoNombre && (
                        <span
                            style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                background: `${tipoColor}15`,
                                color: tipoColor,
                                border: `1px solid ${tipoColor}30`
                            }}
                        >
                            {tipoNombre}
                        </span>
                    )}
                </div>

                {evento.ubicacion && (
                    <div className="event-location-row" style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={15} className="flex-shrink-0" />
                        <span style={{ lineHeight: 1.4 }}>{evento.ubicacion}</span>
                    </div>
                )}

                {evento.modalidades && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                        <span
                            className="event-modalidad"
                            style={{
                                background: 'transparent',
                                color: evento.modalidades.color,
                                padding: 0,
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            <span
                                className="dot"
                                style={{
                                    background: evento.modalidades.color,
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                }}
                            />
                            {evento.modalidades.nombre}
                        </span>
                    </div>
                )}

                {evento.descripcion && (
                    <p style={{
                        marginTop: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        lineHeight: 1.5
                    }}>
                        {evento.descripcion}
                    </p>
                )}

                {/* Botón de Cómo Llegar (Solo si hay URL) */}
                {evento.ubicacion_url && (
                    <a
                        href={evento.ubicacion_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-location-action"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginTop: '1.25rem',
                            width: '100%',
                            padding: '0.6rem',
                            background: '#F9FAFB',
                            color: '#374151',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            border: '1px solid #E5E7EB',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Map size={16} />
                        Cómo llegar
                    </a>
                )}
            </div>
        </div>
    );
}
