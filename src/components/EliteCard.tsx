'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EliteCardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    delay?: number;
    title?: string;
    action?: ReactNode;
    noPadding?: boolean;
}

export default function EliteCard({
    children,
    className = '',
    contentClassName = '',
    delay = 0,
    title,
    action,
    noPadding = false
}: EliteCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.8, 0.25, 1] }}
            className={cn(
                // ✅ CORREGIDO: Usar CSS variables consistentes
                "relative overflow-hidden",
                "bg-[var(--color-surface)]",
                "border border-[rgba(30,58,138,0.08)]",
                "shadow-[var(--shadow-sm)]",
                "rounded-[var(--radius-lg)]", // 16px consistente
                "hover:shadow-[var(--shadow-md)]",
                "transition-all duration-300",
                className
            )}
        >
            {/* ✅ CORREGIDO: Gradient border SIN border-radius individual */}
            <div 
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-cop-blue)] via-blue-500 to-[var(--color-cop-blue)] opacity-80" 
            />

            {(title || action) && (
                <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white backdrop-blur-sm">
                    {title && (
                        <h3 className="text-lg font-bold text-[var(--color-text)] tracking-tight">
                            {title}
                        </h3>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}

            <div className={cn(
                noPadding ? "p-0" : "p-6",
                contentClassName
            )}>
                {children}
            </div>
        </motion.div>
    );
}
