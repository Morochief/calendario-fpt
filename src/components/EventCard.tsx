'use client';

import { EventoConModalidad } from '@/lib/types';

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
                overflow: 'hidden' // Ensure image doesn't overflow rounded corners
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
                <div className="event-date">
                    {diaSemana}, {dia} de {mes}
                </div>
                <div className="event-title">{evento.titulo}</div>

                <div className="event-meta">
                    {evento.hora && (
                        <span>🕐 {evento.hora.slice(0, 5)} hs</span>
                    )}

                    {tipoNombre && (
                        <span
                            style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                background: `${tipoColor}20`,
                                color: tipoColor
                            }}
                        >
                            {tipoNombre}
                        </span>
                    )}
                </div>

                {evento.ubicacion && (
                    <div className="event-location-row" style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>📍</span>
                        <span>{evento.ubicacion}</span>
                    </div>
                )}

                {evento.modalidades && (
                    <div style={{ marginTop: '0.75rem' }}>
                        <span
                            className="event-modalidad"
                            style={{
                                background: `${evento.modalidades.color}15`,
                                color: evento.modalidades.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            <span
                                className="dot"
                                style={{
                                    background: evento.modalidades.color,
                                    width: '8px',
                                    height: '8px',
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
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.6rem',
                            background: '#F3F4F6',
                            color: '#1F2937',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span>🗺️</span>
                        Cómo llegar
                    </a>
                )}
            </div>
        </div>
    );
}
