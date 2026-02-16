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

    return (
        <div
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Ver evento: ${evento.titulo}`}
            className="flex items-center gap-2 py-1.5 px-2 mb-1 bg-surface border border-border-elite rounded-md cursor-pointer text-xs transition-all duration-200 ease-smooth hover:shadow-elite-sm hover:translate-x-1 hover:border-border-hover focus-visible:outline-2 focus-visible:outline-cop-blue focus-visible:outline-offset-1"
            style={{
                borderLeft: `3px solid ${evento.modalidades?.color || 'var(--color-cop-blue)'}`,
            }}
        >
            {evento.hora && (
                <span className="text-text-muted flex items-center gap-1 font-medium">
                    <Clock size={12} />
                    {evento.hora.slice(0, 5)}
                </span>
            )}

            <span className="font-semibold text-text-elite whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                {evento.titulo}
            </span>
        </div>
    );
}
