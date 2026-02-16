'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
    value: string;
    label: string;
    color?: string;
}

interface AdminFilterDropdownProps {
    label: string;
    icon: LucideIcon;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function AdminFilterDropdown({
    label,
    icon: Icon,
    options,
    value,
    onChange,
    placeholder = "Seleccionar"
}: AdminFilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    // Position the portal menu relative to the trigger
    const updatePosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 220),
            });
        }
    }, []);

    // Close on click outside
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

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Close on scroll to avoid orphaned menus
    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);
    const isDefault = value === 'todos' || value === 'todas' || value === '';

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (!isOpen) updatePosition();
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    minWidth: '180px',
                    padding: '0.5rem 0.875rem',
                    background: isOpen ? 'rgba(30, 58, 138, 0.04)' : 'white',
                    border: `1.5px solid ${isOpen ? 'rgba(30, 58, 138, 0.3)' : 'rgba(30, 58, 138, 0.12)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: isDefault ? '#475569' : '#1E3A8A',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 0 3px rgba(30, 58, 138, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.25)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.08)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.12)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    }
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <Icon size={15} style={{ color: isDefault ? '#94A3B8' : '#1E3A8A', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedOption ? selectedOption.label : label}
                    </span>
                </span>
                <ChevronDown
                    size={14}
                    style={{
                        color: isDefault ? '#94A3B8' : '#1E3A8A',
                        flexShrink: 0,
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                />
            </button>

            {/* Portal-rendered dropdown — outside all parent overflow contexts */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={menuRef}
                            role="listbox"
                            aria-label={`Filtrar por ${label}`}
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }}
                            style={{
                                position: 'fixed',
                                top: menuPos.top,
                                left: menuPos.left,
                                width: menuPos.width,
                                zIndex: 9999,
                                background: 'white',
                                border: '1.5px solid rgba(30, 58, 138, 0.12)',
                                borderRadius: '12px',
                                boxShadow: '0 12px 40px rgba(30, 58, 138, 0.14), 0 4px 12px rgba(0,0,0,0.06)',
                                overflow: 'hidden',
                            }}
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={value === option.value}
                                    onClick={() => handleSelect(option.value)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        padding: '0.625rem 1rem',
                                        fontSize: '0.8125rem',
                                        fontWeight: value === option.value ? 700 : 500,
                                        color: value === option.value ? '#1E3A8A' : '#475569',
                                        background: value === option.value ? 'rgba(30, 58, 138, 0.05)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(30, 58, 138, 0.06)';
                                        e.currentTarget.style.color = '#1E3A8A';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = value === option.value ? 'rgba(30, 58, 138, 0.05)' : 'transparent';
                                        e.currentTarget.style.color = value === option.value ? '#1E3A8A' : '#475569';
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {option.color && (
                                            <span style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                backgroundColor: option.color,
                                                boxShadow: `0 0 0 2px ${option.color}20`,
                                                flexShrink: 0,
                                            }} />
                                        )}
                                        {option.label}
                                    </span>
                                    {value === option.value && (
                                        <Check size={14} style={{ color: '#1E3A8A', flexShrink: 0 }} />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
