'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface EliteModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: string;
    contentClassName?: string;
}

export default function EliteModal({
    isOpen,
    onClose,
    title,
    children,
    width = 'max-w-md',
    contentClassName
}: EliteModalProps) {

    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Prevent SSR issues
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ✅ CORREGIDO: z-index consistente con globals.css */}
                    {/* Backdrop - z-index: 200 (mismo que .admin-overlay) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[rgba(30,58,138,0.15)] backdrop-blur-[var(--backdrop-blur-overlay)] z-[var(--z-overlay)]"
                        style={{ zIndex: 200 }}
                    />

                    {/* Modal Container - z-index: 201 (encima del backdrop) */}
                    <div 
                        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                        style={{ zIndex: 201 }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            className={cn(
                                "w-full pointer-events-auto",
                                "bg-[var(--color-surface)]",
                                "rounded-[var(--radius-lg)]",
                                "shadow-[var(--shadow-xl)]",
                                "border border-[var(--color-border)]",
                                "overflow-hidden",
                                width
                            )}
                        >
                            {/* Header */}
                            <div className={cn(
                                "px-6 py-4",
                                "border-b border-[var(--color-border)]",
                                "flex items-center justify-between",
                                "bg-gradient-to-r from-[rgba(30,58,138,0.02)] to-white"
                            )}>
                                <h3 className="font-bold text-[var(--color-text)] text-lg">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        "p-1 rounded-full",
                                        "text-[var(--color-text-muted)]",
                                        "hover:text-[var(--color-text)]",
                                        "hover:bg-[rgba(30,58,138,0.04)]",
                                        "transition-colors duration-150"
                                    )}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className={cn("p-6", contentClassName)}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
