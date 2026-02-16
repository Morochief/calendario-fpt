'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EliteTableProps<T> {
    data: T[];
    gridCols: string; // e.g., "1fr 150px 100px"
    header: ReactNode;
    renderRow: (item: T) => ReactNode;
    emptyMessage?: string;
    keyExtractor: (item: T) => string;
    forceFullWidth?: boolean; // ✅ RENOMBRADO para claridad
}

export default function EliteTable<T>({
    data,
    gridCols,
    header,
    renderRow,
    emptyMessage = "No se encontraron registros",
    keyExtractor,
    forceFullWidth = false // ✅ CORREGIDO: Default false = permite min-width
}: EliteTableProps<T>) {
    return (
        <div className="w-full overflow-x-auto scrollbar-elite">
            {/* ✅ CORREGIDO: Lógica invertida arreglada */}
            <div className={forceFullWidth ? "w-full" : "min-w-[800px]"}>

                {/* Header */}
                <div
                    style={{ gridTemplateColumns: gridCols }}
                    className={cn(
                        "grid gap-4 px-6 py-3 mb-2",
                        "text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider",
                        "border-b border-[var(--color-border)]",
                        "bg-[rgba(30,58,138,0.02)]"
                    )}
                >
                    {header}
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-3">
                    <AnimatePresence initial={false} mode='popLayout'>
                        {data.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={cn(
                                    "flex flex-col items-center justify-center py-16",
                                    "text-[var(--color-text-muted)]",
                                    "bg-[rgba(30,58,138,0.02)]",
                                    "rounded-[var(--radius-md)]",
                                    "border-2 border-dashed border-[var(--color-border)]"
                                )}
                            >
                                <div className="p-4 bg-white rounded-full shadow-[var(--shadow-xs)] mb-3">
                                    <Search className="w-6 h-6 text-[var(--color-text-muted)]" />
                                </div>
                                <p className="font-medium text-[var(--color-text-secondary)]">
                                    {emptyMessage}
                                </p>
                            </motion.div>
                        ) : (
                            data.map((item, index) => (
                                <motion.div
                                    key={keyExtractor(item)}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    style={{ gridTemplateColumns: gridCols }}
                                    className={cn(
                                        "group grid gap-4 px-4 py-4",
                                        "bg-white rounded-[var(--radius-md)]",
                                        "border border-[var(--color-border)]",
                                        "shadow-[var(--shadow-xs)]",
                                        "hover:shadow-[var(--shadow-md)]",
                                        "hover:border-[var(--color-border-hover)]",
                                        "hover:-translate-y-0.5",
                                        "transition-all duration-200",
                                        "items-center relative"
                                    )}
                                >
                                    {renderRow(item)}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ✅ Sub-componentes con tipado mejorado
interface CellProps {
    children: ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export function EliteHeader({ children, className = '', align = 'left' }: CellProps) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <div className={cn(alignClass, className)}>
            {children}
        </div>
    );
}

export function EliteCell({ children, className = '', align = 'left' }: CellProps) {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <div className={cn('truncate', alignClass, className)}>
            {children}
        </div>
    );
}
