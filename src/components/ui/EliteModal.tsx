'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EliteModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: string;
}

export default function EliteModal({
    isOpen,
    onClose,
    title,
    children,
    width = 'max-w-md'
}: EliteModalProps) {

    // Lock scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Portal to avoid z-index issues
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
                            className={`
                                w-full ${width}
                                bg-white rounded-lg
                                shadow-xl
                                overflow-hidden
                                pointer-events-auto
                            `}
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
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
