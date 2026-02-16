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
                bg-white/80 backdrop-blur-xl
                border border-white/40
                shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                rounded-2xl
                ${className}
            `}
        >
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 opacity-80" />

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
