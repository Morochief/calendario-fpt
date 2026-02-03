'use client';

import { EventoConModalidad } from '@/lib/types';
import MiniMonth from './MiniMonth';

const MESES_COMPLETOS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface AnnualCalendarProps {
    eventos: EventoConModalidad[];
    year?: number;
}

export default function AnnualCalendar({ eventos, year = 2026 }: AnnualCalendarProps) {
    return (
        <div className="annual-calendar">
            <div className="annual-grid">
                {MESES_COMPLETOS.map((mes, index) => (
                    <MiniMonth
                        key={mes}
                        mes={mes}
                        mesIndex={index}
                        year={year}
                        eventos={eventos}
                    />
                ))}
            </div>
        </div>
    );
}
