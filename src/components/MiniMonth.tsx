'use client';

import { EventoConModalidad } from '@/lib/types';

interface MiniMonthProps {
    mes: string;
    mesIndex: number;
    year: number;
    eventos: EventoConModalidad[];
}

export default function MiniMonth({ mes, mesIndex, year, eventos }: MiniMonthProps) {
    // Obtener primer día del mes y cantidad de días
    const firstDay = new Date(year, mesIndex, 1);
    const lastDay = new Date(year, mesIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = domingo

    // Eventos de este mes
    const eventosDelMes = eventos.filter(e => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        return fecha.getMonth() === mesIndex && fecha.getFullYear() === year;
    });

    // Mapear eventos por día
    const eventosPorDia: { [key: number]: EventoConModalidad[] } = {};
    eventosDelMes.forEach(e => {
        const dia = new Date(e.fecha + 'T12:00:00').getDate();
        if (!eventosPorDia[dia]) eventosPorDia[dia] = [];
        eventosPorDia[dia].push(e);
    });

    // Generar días del calendario
    const dias = [];

    // Días vacíos antes del primer día
    for (let i = 0; i < startDayOfWeek; i++) {
        dias.push(<div key={`empty-${i}`} className="mini-day empty"></div>);
    }

    // Días del mes
    for (let dia = 1; dia <= daysInMonth; dia++) {
        const eventosDelDia = eventosPorDia[dia] || [];
        const tieneEventos = eventosDelDia.length > 0;

        dias.push(
            <div
                key={dia}
                className={`mini-day ${tieneEventos ? 'has-event' : ''}`}
                title={tieneEventos ? eventosDelDia.map(e => e.titulo).join('\n') : ''}
            >
                <span className="day-number">{dia}</span>
                {tieneEventos && (
                    <div className="event-dots">
                        {eventosDelDia.slice(0, 3).map((e, i) => (
                            <span
                                key={i}
                                className="event-dot"
                                style={{ background: e.modalidades?.color || '#DC2626' }}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mini-month">
            <div className="mini-month-header">{mes}</div>
            <div className="mini-month-weekdays">
                <span>D</span><span>L</span><span>M</span><span>M</span>
                <span>J</span><span>V</span><span>S</span>
            </div>
            <div className="mini-month-grid">
                {dias}
            </div>
            {eventosDelMes.length > 0 && (
                <div className="mini-month-events">
                    {eventosDelMes.slice(0, 4).map((e, i) => (
                        <div key={i} className="mini-event" title={e.titulo}>
                            <span
                                className="mini-event-dot"
                                style={{ background: e.modalidades?.color || '#DC2626' }}
                            />
                            <span className="mini-event-date">
                                {new Date(e.fecha + 'T12:00:00').getDate()}
                            </span>
                            <span className="mini-event-title">{e.titulo}</span>
                        </div>
                    ))}
                    {eventosDelMes.length > 4 && (
                        <div className="mini-event-more">
                            +{eventosDelMes.length - 4} más
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
