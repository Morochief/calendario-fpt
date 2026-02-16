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
        <div className="w-full overflow-x-auto">
            <div className={constrainMinWidth ? "w-full" : "min-w-[800px]"}>

                {/* Header */}
                <div
                    style={{ gridTemplateColumns: gridCols }}
                    className="grid gap-4 px-6 py-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50"
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
                                className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-200"
                            >
                                <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                                    <Search className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-500">{emptyMessage}</p>
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
                                    className="group grid gap-4 px-4 py-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 ease-out items-center relative"
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
