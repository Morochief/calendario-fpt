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
            className="group flex items-center gap-2 py-2.5 px-3 mb-1.5 bg-white border border-[rgba(30,58,138,0.12)] border-l-[4px] rounded-[10px] cursor-pointer text-[13px] transition-all duration-200 shadow-sm hover:shadow-md hover:border-cop-blue/20 hover:translate-x-1 outline-none focus:ring-2 focus:ring-cop-blue/20"
            style={{
                borderLeftColor: modalityColor,
            }}
        >
            {evento.hora && (
                <span className="flex items-center gap-1 text-text-muted font-semibold text-xs shrink-0">
                    <Clock size={12} />
                    {evento.hora.slice(0, 5)}
                </span>
            )}

            <span className="font-semibold text-cop-blue whitespace-nowrap overflow-hidden text-ellipsis flex-1 group-hover:text-fpt-red transition-colors">
                {evento.titulo}
            </span>
        </div>
    );
}
