'use client';

import { MESES, EventoConModalidad } from '@/lib/types';
import EventCard from './EventCard';

interface MonthCardProps {
    mes: typeof MESES[number];
    mesIndex: number;
    eventos: EventoConModalidad[];
}

export default function MonthCard({ mes, mesIndex, eventos }: MonthCardProps) {
    // Filtrar eventos de este mes (mesIndex es 0-based, pero enero = 1, feb = 2...)
    // El array MESES es de enero a noviembre, así que mesIndex 0 = enero = mes 1
    const eventosDelMes = eventos.filter(e => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        return fecha.getMonth() === mesIndex; // getMonth es 0-based
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return (
        <div className="month-card">
            <div className="month-header">
                {mes} 2026
            </div>
            <div className="month-content">
                {eventosDelMes.length === 0 ? (
                    <div className="month-empty">
                        Sin eventos programados
                    </div>
                ) : (
                    eventosDelMes.map(evento => (
                        <EventCard key={evento.id} evento={evento} />
                    ))
                )}
            </div>
        </div>
    );
}
