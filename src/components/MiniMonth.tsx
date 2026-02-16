'use client';

import { useState } from 'react';
import { EventoConModalidad } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MiniMonthProps {
    mes: string;
    mesIndex: number;
    year: number;
    eventos: EventoConModalidad[];
}

export default function MiniMonth({ mes, mesIndex, year, eventos }: MiniMonthProps) {
    const [expandido, setExpandido] = useState(false);

    const firstDay = new Date(year, mesIndex, 1);
    const lastDay = new Date(year, mesIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const eventosDelMes = eventos.filter(e => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        return fecha.getMonth() === mesIndex && fecha.getFullYear() === year;
    });

    const eventosPorDia: { [key: number]: EventoConModalidad[] } = {};
    eventosDelMes.forEach(e => {
        const dia = new Date(e.fecha + 'T12:00:00').getDate();
        if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
        eventosPorDia[dia].push(e);
    });

    const dias = [];

    for (let i = 0; i < startDayOfWeek; i++) {
        dias.push(<div key={`empty-${i}`} className="bg-transparent"></div>);
    }

    for (let dia = 1; dia <= daysInMonth; dia++) {
        const eventosDelDia = eventosPorDia[dia] || [];
        const tieneEventos = eventosDelDia.length > 0;

        dias.push(
            <div
                key={dia}
                className={`aspect-square flex flex-col items-center justify-center text-[11px] text-[var(--color-text-secondary)] rounded-[6px] cursor-default relative transition-all duration-200 ${tieneEventos
                    ? 'bg-white font-bold cursor-pointer shadow-[var(--shadow-sm)] border border-[var(--color-border)] hover:scale-110 hover:z-10 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-cop-blue)] hover:text-[var(--color-cop-blue)] group'
                    : ''
                    }`}
                title={tieneEventos ? eventosDelDia.map(e => e.titulo).join('\n') : ''}
            >
                <span className="leading-none">{dia}</span>
                {tieneEventos && (
                    <div className="flex gap-px mt-px">
                        {eventosDelDia.slice(0, 3).map((e, i) => (
                            <span
                                key={i}
                                className="w-[3px] h-[3px] rounded-full transition-colors group-hover:bg-[var(--color-cop-blue)]"
                                style={{ background: e.modalidades?.color || '#171717' }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const eventosAMostrar = expandido ? eventosDelMes : eventosDelMes.slice(0, 3);
    const tieneEventosOcultos = eventosDelMes.length > 3 && !expandido;

    return (
        <div className={`bg-white rounded-[12px] p-4 text-xs transition-all border border-[var(--color-border)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)] border-t-[3px] border-t-[#D91E18] ${expandido ? 'ring-2 ring-[#1E3A8A]/10' : ''}`}>
            <div
                className="font-semibold uppercase tracking-wider text-text-elite mb-2 text-xs flex items-center justify-between"
                onClick={() => eventosDelMes.length > 0 && setExpandido(!expandido)}
                style={{ cursor: eventosDelMes.length > 0 ? 'pointer' : 'default' }}
            >
                {mes}
                {eventosDelMes.length > 0 && (
                    <span className="text-[10px] bg-cop-blue/10 px-1.5 py-0.5 rounded-full text-cop-blue font-bold">{eventosDelMes.length}</span>
                )}
            </div>
            <div className="grid grid-cols-7 text-center font-medium text-text-muted text-[10px] mb-1">
                <span>D</span><span>L</span><span>M</span><span>M</span>
                <span>J</span><span>V</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {dias}
            </div>
            {eventosDelMes.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border-elite">
                    {eventosAMostrar.map((e, i) => (
                        <div key={i} className="flex items-center gap-1.5 py-1 text-[10px] text-text-elite cursor-pointer transition-all rounded-[3px] px-1 hover:bg-cop-blue/10 hover:translate-x-0.5" title={e.titulo}>
                            <span
                                className="w-[5px] h-[5px] rounded-full shrink-0"
                                style={{ background: e.modalidades?.color || '#171717' }}
                            />
                            <span className="font-semibold text-text-secondary min-w-[16px]">
                                {new Date(e.fecha + 'T12:00:00').getDate()}
                            </span>
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">{e.titulo}</span>
                        </div>
                    ))}
                    {tieneEventosOcultos && (
                        <button
                            className="w-full mt-1 flex items-center justify-center gap-1 text-[10px] text-cop-blue font-medium hover:underline py-1"
                            onClick={() => setExpandido(true)}
                        >
                            Ver {eventosDelMes.length - 3} más
                            <ChevronDown size={10} strokeWidth={1.5} />
                        </button>
                    )}
                    {expandido && eventosDelMes.length > 3 && (
                        <button
                            className="w-full mt-1 flex items-center justify-center gap-1 text-[10px] text-cop-blue font-medium hover:underline py-1"
                            onClick={() => setExpandido(false)}
                        >
                            Mostrar menos
                            <ChevronUp size={10} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
