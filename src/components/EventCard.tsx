'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock, MapPin, Map, Building2 } from 'lucide-react';

interface EventCardProps {
    evento: EventoConModalidad;
}

function isValidImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function EventCard({ evento }: EventCardProps) {
    const fecha = new Date(evento.fecha + 'T12:00:00');
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });

    const tipoNombre = evento.tipos_evento?.nombre || evento.tipo || '';
    const tipoColor = evento.tipos_evento?.color || '#94A3B8';
    const hasImage = !!evento.imagen_url && isValidImageUrl(evento.imagen_url);

    return (
        <div
            className={`event-card ${hasImage ? 'has-image' : ''}`}
            style={{
                borderLeftColor: evento.modalidades?.color || 'var(--color-cop-blue)',
            }}
        >
            {hasImage && (
                <div
                    className="event-hero-image"
                    style={{
                        backgroundImage: `url(${evento.imagen_url})`,
                        height: '140px',
                        backgroundSize: 'cover',
                        backgroundPosition: evento.imagen_position || 'center',
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
                                borderRadius: 'var(--radius-sm)',
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
                    <div className="mt-3 text-[0.8125rem] text-text-secondary flex items-center gap-1.5">
                        <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0" />
                        <span style={{ lineHeight: 1.4 }}>{evento.ubicacion}</span>
                    </div>
                )}

                {evento.clubes && (
                    <div className="mt-2 text-[0.8125rem] text-text-secondary flex items-center gap-1.5">
                        <Building2 size={14} strokeWidth={1.5} className="flex-shrink-0" />
                        <span style={{ lineHeight: 1.4, color: evento.clubes.color || 'inherit', fontWeight: 500 }}>
                            {evento.clubes.nombre}
                        </span>
                    </div>
                )}

                {evento.modalidades && (
                    <div className="mt-3.5 pt-3.5 border-t border-border-elite">
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
                    <p className="mt-3 text-[0.8125rem] text-text-secondary leading-relaxed">
                        {evento.descripcion}
                    </p>
                )}

                {evento.ubicacion_url && (
                    <a
                        href={evento.ubicacion_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-location-action inline-flex items-center justify-center gap-2 mt-4 w-full py-2 bg-transparent text-text-elite rounded-elite-sm text-[0.8125rem] font-medium no-underline border border-border-elite transition-all duration-250 hover:shadow-elite-sm hover:border-border-hover hover:bg-blue-50/30 active:scale-[0.97]"
                    >
                        <Map size={15} strokeWidth={1.5} />
                        Cómo llegar
                    </a>
                )}
            </div>
        </div>
    );
}
