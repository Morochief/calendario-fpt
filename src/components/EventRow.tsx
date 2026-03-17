import { memo } from 'react';
import { EventoConModalidad } from '@/lib/types';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventRowProps {
    evento: EventoConModalidad;
    onClick: () => void;
}

const EventRow = memo(({ evento, onClick }: EventRowProps) => {
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

            <span className={cn(
                "font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex-1 transition-colors",
                (evento.estado_override === 'cancelado' || evento.estado_override === 'suspendido')
                    ? "text-slate-400 line-through decoration-slate-300"
                    : "text-cop-blue group-hover:text-fpt-red"
            )}>
                {evento.titulo}
            </span>

            {evento.estado_override && (
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ml-2 shrink-0 border",
                    evento.estado_override === 'cancelado' ? "bg-red-50 text-red-600 border-red-100" :
                        evento.estado_override === 'suspendido' ? "bg-orange-50 text-orange-600 border-orange-100" :
                            "bg-yellow-50 text-yellow-600 border-yellow-100"
                )}>
                    {evento.estado_override === 'cancelado' ? 'Canc' :
                        evento.estado_override === 'suspendido' ? 'Susp' : 'Post'}
                </span>
            )}
        </div>
    );
});

EventRow.displayName = 'EventRow';

export default EventRow;
