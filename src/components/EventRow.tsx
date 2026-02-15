'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock } from 'lucide-react';

interface EventRowProps {
    evento: EventoConModalidad;
    onClick: () => void;
}

export default function EventRow({ evento, onClick }: EventRowProps) {
    const tipoColor = evento.tipos_evento?.color || '#737373';

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.5rem',
                marginBottom: '0.25rem',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '4px',
                cursor: 'pointer',
                borderLeft: `3px solid ${evento.modalidades?.color || '#171717'}`,
                transition: 'all 0.2s ease',
                fontSize: '0.75rem'
            }}
            className="hover:shadow-sm hover:translate-x-1"
        >
            {evento.hora && (
                <span style={{
                    color: '#737373',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontWeight: 500
                }}>
                    <Clock size={12} />
                    {evento.hora.slice(0, 5)}
                </span>
            )}

            <span style={{
                fontWeight: 600,
                color: '#171717',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1
            }}>
                {evento.titulo}
            </span>

            {/* Optional: Small pill for type if space permits, or just rely on border color */}
        </div>
    );
}
