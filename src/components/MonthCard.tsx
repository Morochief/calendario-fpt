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
            <div className="bg-white rounded-[14px] border-[1.5px] border-border-elite overflow-hidden transition-all duration-300 shadow-elite-sm hover:shadow-elite-lg hover:-translate-y-1 hover:border-cop-blue/25 group">
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 text-cop-blue p-4 text-[13px] font-bold uppercase tracking-wider border-b border-cop-blue/10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-fpt-red after:to-cop-blue after:opacity-40">
                    {mes} 2026
                </div>
                <div className="p-4 min-h-[100px] bg-white">
                    {eventosDelMes.length === 0 ? (
                        <div className="text-text-muted text-[13px] text-center py-8 italic">
                            Sin eventos programados
                        </div>
                    ) : (
                        eventosDelMes.map(evento => (
                            <EventRow
                                key={evento.id}
                                evento={evento}
                                onClick={() => setSelectedEvent(evento)}
                            />
                        ))
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
