'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface UserDropdownProps {
    email: string | undefined;
    onLogout: () => void;
}

export default function UserDropdown({ email, onLogout }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Extract initial for avatar
    const initial = email ? email[0].toUpperCase() : 'A';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={cn(
                    "flex items-center gap-2",
                    "px-3 py-1.5 rounded-full",
                    "border border-slate-200",
                    "hover:bg-slate-50 hover:border-slate-300",
                    "transition-all duration-200",
                    isOpen && "ring-2 ring-blue-100 border-blue-200"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Menú de usuario"
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {initial}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                        {email?.split('@')[0]}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={cn(
                        "text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                        role="menu"
                    >
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                                Conectado como
                            </p>
                            <p className="text-sm font-semibold text-slate-900 truncate" title={email}>
                                {email}
                            </p>
                        </div>

                        <div className="p-1">
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                                role="menuitem"
                                onClick={() => setIsOpen(false)}
                            >
                                <Settings size={16} />
                                <span>Panel de Administración</span>
                            </Link>

                            <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                onClick={() => {
                                    setIsOpen(false);
                                    onLogout();
                                }}
                                role="menuitem"
                            >
                                <LogOut size={16} />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
