import { memo } from 'react';
import { MESES, EventoConModalidad } from '@/lib/types';
import EventRow from './EventRow';

interface MonthCardProps {
    mes: typeof MESES[number];
    mesIndex: number;
    eventos: EventoConModalidad[];
    onEventClick: (evento: EventoConModalidad) => void;
}

const MonthCard = memo(({ mes, mesIndex, eventos, onEventClick }: MonthCardProps) => {
    return (
        <div className="bg-white rounded-[16px] border border-[var(--color-border)] overflow-hidden transition-all duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 group relative border-t-4 border-t-[#D91E18]">
            
            <div className="relative p-5 flex items-center justify-between border-b border-[var(--color-border)] bg-gradient-to-br from-white to-blue-50/30">
                <span className="text-[14px] font-black text-[#1E3A8A] uppercase tracking-widest flex items-center gap-2">
                    {mes} <span className="text-[#D91E18] font-bold">2026</span>
                </span>
                <div className="h-2 w-2 rounded-full bg-[#1E3A8A] opacity-20 group-hover:opacity-100 transition-opacity animate-pulse"></div>
            </div>

            <div className="p-2 bg-white min-h-[100px]">
                {eventos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-muted)] gap-2 opacity-60">
                        <span className="text-xs font-medium italic">Sin eventos programados</span>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {eventos.map(evento => (
                            <EventRow
                                key={evento.id}
                                evento={evento}
                                onClick={() => onEventClick(evento)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

MonthCard.displayName = 'MonthCard';

export default MonthCard;
