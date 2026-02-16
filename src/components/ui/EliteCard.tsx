'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EliteCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    title?: string;
    action?: ReactNode;
}

export default function EliteCard({
    children,
    className = '',
    delay = 0,
    title,
    action
}: EliteCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.25, 0.8, 0.25, 1] }}
            className={`
                relative overflow-hidden
                bg-surface
                border border-[rgba(30,58,138,0.08)]
                shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)]
                rounded-[16px]
                ${className}
            `}
        >
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cop-blue via-blue-500 to-cop-blue opacity-80" style={{ borderRadius: '16px 16px 0 0' }} />

            {(title || action) && (
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    {title && (
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                            {title}
                        </h3>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}

            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
}
