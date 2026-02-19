'use client';

import { EventoConModalidad } from '@/lib/types';
import { Calendar } from 'lucide-react';

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
            className="group flex items-center gap-3 py-3 px-3.5 mb-2 bg-white border border-[rgba(30,58,138,0.08)] border-l-[4px] rounded-[10px] cursor-pointer text-[13px] transition-all duration-200 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[rgba(30,58,138,0.2)] hover:translate-x-1 outline-none focus:ring-2 focus:ring-[var(--color-cop-blue)]/20"
            style={{
                borderLeftColor: modalityColor,
            }}
        >
            <span className="flex items-center gap-1 text-text-muted font-semibold text-xs shrink-0 uppercase tracking-tight">
                <Calendar size={12} />
                {new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')}
            </span>

            <span className="font-semibold text-cop-blue whitespace-nowrap overflow-hidden text-ellipsis flex-1 group-hover:text-fpt-red transition-colors">
                {evento.titulo}
            </span>
        </div>
    );
}
