'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface EliteTableProps<T> {
    data: T[];
    gridCols: string; // e.g., "1fr 150px 100px"
    header: ReactNode;
    renderRow: (item: T) => ReactNode;
    emptyMessage?: string;
    keyExtractor: (item: T) => string;
    constrainMinWidth?: boolean;
}

export default function EliteTable<T>({
    data,
    gridCols,
    header,
    renderRow,
    emptyMessage = "No se encontraron registros",
    keyExtractor,
    constrainMinWidth = false
}: EliteTableProps<T>) {
    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className={constrainMinWidth ? "w-full" : "min-w-[800px]"}> {/* Ensure min-width for scroll on small screens unless constrained */}

                {/* Header */}
                <div
                    style={{ gridTemplateColumns: gridCols }}
                    className="grid gap-4 px-6 py-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100"
                >
                    {header}
                </div>

                {/* Body */}
                <div className="space-y-2">
                    <AnimatePresence initial={false} mode='popLayout'>
                        {data.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"
                            >
                                <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                    <Search className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-medium">{emptyMessage}</p>
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
                                    className="group grid gap-4 px-6 py-4 bg-white rounded-xl border border-[rgba(30,58,138,0.06)] shadow-[0_2px_6px_rgba(30,58,138,0.04)] hover:shadow-[0_12px_32px_rgba(30,58,138,0.12),0_4px_8px_rgba(30,58,138,0.06)] hover:-translate-y-0.5 hover:scale-[1.003] hover:border-[rgba(30,58,138,0.12)] transition-all duration-[250ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] items-center relative"
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

// Sub-component for Headers to ensure cleaner usage
export function EliteHeader({ children, className = '', align = 'left' }: { children: ReactNode, className?: string, align?: 'left' | 'center' | 'right' }) {
    const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return <div className={`${alignment} ${className}`}>{children}</div>;
}

// Sub-component for Cells
export function EliteCell({ children, className = '', align = 'left' }: { children: ReactNode, className?: string, align?: 'left' | 'center' | 'right' }) {
    const alignment = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return <div className={`truncate ${alignment} ${className}`}>{children}</div>;
}
