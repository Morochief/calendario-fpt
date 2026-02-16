'use client';

import { EventoConModalidad } from '@/lib/types';
import { Clock } from 'lucide-react';

interface EventRowProps {
    evento: EventoConModalidad;
    onClick: () => void;
}

export default function EventRow({ evento, onClick }: EventRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    const modalityColor = evento.modalidades?.color || '#1E3A8A';

    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Ver evento: ${evento.titulo}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.75rem',
                marginBottom: '0.375rem',
                background: 'white',
                border: '1.5px solid rgba(30, 58, 138, 0.12)',
                borderLeft: `4px solid ${modalityColor}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(30, 58, 138, 0.06)',
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 4px 16px rgba(30, 58, 138, 0.12)';
                el.style.borderColor = 'rgba(30, 58, 138, 0.2)';
                el.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = '0 1px 4px rgba(30, 58, 138, 0.06)';
                el.style.borderColor = 'rgba(30, 58, 138, 0.12)';
                el.style.transform = 'translateX(0)';
            }}
        >
            {evento.hora && (
                <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    color: '#94A3B8', fontWeight: 600, fontSize: '0.75rem',
                    flexShrink: 0,
                }}>
                    <Clock size={12} />
                    {evento.hora.slice(0, 5)}
                </span>
            )}

            <span style={{
                fontWeight: 600, color: '#1E3A8A',
                whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', flex: 1,
            }}>
                {evento.titulo}
            </span>
        </div>
    );
}
