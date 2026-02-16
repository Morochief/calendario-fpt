'use client';

import { MESES, EventoConModalidad } from '@/lib/types';
import EventRow from './EventRow';
import EventModal from './EventModal';
import { useState } from 'react';

interface MonthCardProps {
    mes: typeof MESES[number];
    mesIndex: number;
    eventos: EventoConModalidad[];
}

export default function MonthCard({ mes, mesIndex, eventos }: MonthCardProps) {
    const [selectedEvent, setSelectedEvent] = useState<EventoConModalidad | null>(null);

    // Filtrar eventos de este mes (mesIndex es 0-based, pero enero = 1, feb = 2...)
    // El array MESES es de enero a noviembre, así que mesIndex 0 = enero = mes 1
    const eventosDelMes = eventos.filter(e => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        return fecha.getMonth() === mesIndex; // getMonth es 0-based
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return (
        <>
            <div className="bg-white rounded-[16px] border border-[var(--color-border)] overflow-hidden transition-all duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 group relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-fpt-red)] via-[var(--color-cop-blue)] to-[var(--color-fpt-red)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative bg-gradient-to-br from-slate-50 to-white p-5 flex items-center justify-between border-b border-[var(--color-border)]">
                    <span className="text-[14px] font-black text-[var(--color-cop-blue)] uppercase tracking-widest">
                        {mes} <span className="text-slate-400 font-normal">2026</span>
                    </span>
                    <div className="h-2 w-2 rounded-full bg-[var(--color-cop-blue)] opacity-20 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="p-2 bg-white min-h-[100px]">
                    {eventosDelMes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-[var(--color-text-muted)] gap-2 opacity-60">
                            <span className="text-xs font-medium italic">Sin eventos programados</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {eventosDelMes.map(evento => (
                                <EventRow
                                    key={evento.id}
                                    evento={evento}
                                    onClick={() => setSelectedEvent(evento)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedEvent && (
                <EventModal
                    evento={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </>
    );
}
