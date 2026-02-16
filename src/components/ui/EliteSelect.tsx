'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectOption {
    value: string;
    label: string;
    color?: string;
}

interface EliteSelectProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: LucideIcon;
    error?: string;
    className?: string;
}

export default function EliteSelect({
    label,
    options,
    value,
    onChange,
    placeholder = "Seleccionar",
    icon: Icon,
    error,
    className
}: EliteSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const updatePosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                menuRef.current && !menuRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (!isOpen) updatePosition();
        setIsOpen(!isOpen);
    };

    return (
        <div className={cn("relative w-full", className)}>
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                className={cn(
                    "w-full px-5 py-3.5 rounded-xl border-2 text-left transition-all duration-300 flex items-center justify-between gap-3 outline-none",
                    isOpen
                        ? "bg-white border-cop-blue/30 shadow-lg shadow-blue-900/5"
                        : "bg-slate-50 border-transparent hover:bg-slate-100/50 hover:border-slate-200",
                    error && "border-fpt-red/30 bg-fpt-red-[4px]",
                    !selectedOption && "text-slate-400"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedOption?.color && (
                        <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse-subtle"
                            style={{
                                backgroundColor: selectedOption.color,
                                boxShadow: `0 0 8px ${selectedOption.color}40`
                            }}
                        />
                    )}
                    {Icon && <Icon size={18} className={cn("flex-shrink-0", selectedOption ? "text-cop-blue" : "text-slate-400")} />}
                    <span className={cn(
                        "truncate font-bold",
                        selectedOption ? "text-slate-800" : "text-slate-400"
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={cn(
                        "flex-shrink-0 transition-transform duration-300",
                        isOpen ? "rotate-180 text-cop-blue" : "text-slate-400"
                    )}
                />
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                position: 'fixed',
                                top: menuPos.top,
                                left: menuPos.left,
                                width: menuPos.width,
                                zIndex: 9999,
                            }}
                            className="bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-blue-900/10 overflow-hidden py-2"
                        >
                            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            "w-full px-4 py-3 flex items-center justify-between gap-3 transition-all duration-200 hover:bg-cop-blue/5 group",
                                            value === option.value ? "bg-cop-blue/5" : "bg-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {option.color && (
                                                <div
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: option.color }}
                                                />
                                            )}
                                            <span className={cn(
                                                "text-sm transition-colors",
                                                value === option.value
                                                    ? "text-cop-blue font-bold"
                                                    : "text-slate-600 font-semibold group-hover:text-cop-blue"
                                            )}>
                                                {option.label}
                                            </span>
                                        </div>
                                        {value === option.value && (
                                            <Check size={16} className="text-cop-blue flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
