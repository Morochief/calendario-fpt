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
        <div className="bg-white rounded-[16px] p-6 border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
