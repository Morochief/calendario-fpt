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

    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#737373';
    const hasImage = !!evento.imagen_url;

    return (
        <div
            className={`event-card ${hasImage ? 'has-image' : ''}`}
            style={{
                borderLeftColor: evento.modalidades?.color || '#171717',
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
                <div style={{ marginBottom: '0.375rem' }}>
                    <div className="event-date">
                        {diaSemana}, {dia} de {mes}
                    </div>
                </div>

                <div className="event-title">{evento.titulo}</div>

                <div className="event-meta">
                    {evento.hora && (
                        <span><Clock size={13} strokeWidth={1.5} /> {evento.hora.slice(0, 5)}</span>
                    )}

                    {tipoNombre && (
                        <span
                            style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                background: `${tipoColor}0A`,
                                color: tipoColor,
                                border: `1px solid ${tipoColor}15`
                            }}
                        >
                            {tipoNombre}
                        </span>
                    )}
                </div>

                {evento.ubicacion && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0" />
                        <span style={{ lineHeight: 1.4 }}>{evento.ubicacion}</span>
                    </div>
                )}

                {evento.modalidades && (
                    <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                        <span
                            className="event-modalidad"
                            style={{
                                background: 'transparent',
                                color: evento.modalidades.color,
                                padding: 0,
                                fontSize: '0.75rem',
                                fontWeight: 500
                            }}
                        >
                            <span
                                className="dot"
                                style={{
                                    background: evento.modalidades.color,
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                }}
                            />
                            {evento.modalidades.nombre}
                        </span>
                    </div>
                )}

                {evento.descripcion && (
                    <p style={{
                        marginTop: '0.75rem',
                        fontSize: '0.8125rem',
                        color: '#737373',
                        lineHeight: 1.6
                    }}>
                        {evento.descripcion}
                    </p>
                )}

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
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.5rem',
                            background: 'transparent',
                            color: '#171717',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            border: '1px solid rgba(0,0,0,0.06)',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <Map size={15} strokeWidth={1.5} />
                        Cómo llegar
                    </a>
                )}
            </div>
        </div>
    );
}
