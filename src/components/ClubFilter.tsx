
import { useState, useRef, useEffect } from 'react';
import { Club } from '@/lib/types';
import { Filter, Check, ChevronDown, X, Building2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClubFilterProps {
    clubes: Club[];
    selected: string | null;
    onSelect: (id: string | null) => void;
    className?: string; // Optional wrapper class to override defaults (like sticky)
    variant?: 'public' | 'admin';
}

export default function ClubFilter({ clubes, selected, onSelect, className, variant = 'public' }: ClubFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedClub = clubes.find(c => c.id === selected);

    const handleSelect = (id: string | null) => {
        onSelect(id);
        setIsOpen(false);
    };

    return (
        <div className={className || "sticky top-[80px] z-[var(--z-filter)] flex py-4 pointer-events-none mb-4 justify-start"} ref={dropdownRef}>
            <div className="relative pointer-events-auto">
                <button
                    className={
                        variant === 'admin'
                            ? ""
                            : `flex items-center justify-between gap-4 px-6 py-3 bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-full font-semibold text-sm text-[var(--color-text)] cursor-pointer shadow-[var(--shadow-md)] transition-all duration-300 hover:border-[var(--color-cop-blue)] hover:shadow-[var(--shadow-lg)] active:scale-98 min-w-[280px] group ${isOpen ? 'ring-2 ring-[var(--color-cop-blue)]/10 border-[var(--color-cop-blue)]' : ''}`
                    }
                    style={
                        variant === 'admin' ? {
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            minWidth: '220px',
                            padding: '0.5rem 0.875rem',
                            background: isOpen ? 'rgba(30, 58, 138, 0.04)' : 'white',
                            border: `1.5px solid ${isOpen ? 'rgba(30, 58, 138, 0.3)' : 'rgba(30, 58, 138, 0.12)'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: selected === null ? '#475569' : '#1E3A8A',
                            transition: 'all 0.2s ease',
                            boxShadow: isOpen ? '0 0 0 3px rgba(30, 58, 138, 0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
                            width: '100%'
                        } : {}
                    }
                    onMouseEnter={(e) => {
                        if (variant === 'admin' && !isOpen) {
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.25)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 138, 0.08)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (variant === 'admin' && !isOpen) {
                            e.currentTarget.style.borderColor = 'rgba(30, 58, 138, 0.12)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                        }
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className={variant === 'admin' ? "" : "flex items-center gap-3"} style={variant === 'admin' ? { display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' } : {}}>
                        {selectedClub ? (
                            <>
                                <Building2 size={variant === 'admin' ? 15 : 18} strokeWidth={1.5} className={variant === 'admin' ? "" : "text-[var(--color-cop-blue)]"} style={variant === 'admin' ? { color: '#1E3A8A', flexShrink: 0 } : {}} />
                                <span className={variant === 'admin' ? "" : "text-[var(--color-text)] truncate max-w-[180px]"} style={variant === 'admin' ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}>{selectedClub.nombre}</span>
                            </>
                        ) : (
                            <>
                                <Building2 size={variant === 'admin' ? 15 : 18} strokeWidth={1.5} className={variant === 'admin' ? "" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-cop-blue)] transition-colors"} style={variant === 'admin' ? { color: '#94A3B8', flexShrink: 0 } : {}} />
                                <span className={variant === 'admin' ? "" : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors"} style={variant === 'admin' ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {}}>Club</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {selected && (
                            <div
                                role="button"
                                onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
                                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={14} />
                            </div>
                        )}
                        <ChevronDown
                            size={variant === 'admin' ? 14 : 16}
                            strokeWidth={1.5}
                            className={variant === 'admin' ? "" : `text-[var(--color-text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-cop-blue)]' : ''}`}
                            style={variant === 'admin' ? { color: selected === null ? '#94A3B8' : '#1E3A8A', flexShrink: 0, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' } : {}}
                        />
                    </div>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-[calc(100%+12px)] left-0 bg-white/95 backdrop-blur-xl border border-[rgba(30,58,138,0.08)] rounded-[20px] shadow-[var(--shadow-xl)] p-2 min-w-[320px] max-h-[60vh] overflow-y-auto z-[var(--z-dropdown)]"
                        >
                            <div className="px-3 py-2 text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                Clubes Disponibles
                            </div>

                            <button
                                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] cursor-pointer transition-all border-none bg-transparent w-full text-left text-[14px] text-[var(--color-text)] hover:bg-[var(--color-bg)] hover:translate-x-1 ${selected === null ? 'bg-[var(--color-cop-blue)]/5 font-semibold text-[var(--color-cop-blue)]' : ''}`}
                                onClick={() => handleSelect(null)}
                            >
                                <div className="w-5 flex justify-center">
                                    {selected === null ? <Check size={16} strokeWidth={2} className="text-[var(--color-cop-blue)]" /> : <Filter size={16} className="text-slate-400" />}
                                </div>
                                Todos los clubes
                            </button>

                            <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent my-2" />

                            <div className="space-y-1">
                                {clubes.map((club) => (
                                    <div key={club.id} className="flex items-center group/item hover:bg-[var(--color-bg)] rounded-[12px] pr-2 transition-all">
                                        <button
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] cursor-pointer transition-all border-none bg-transparent flex-1 text-left text-[14px] text-[var(--color-text)] group ${selected === club.id ? 'bg-[var(--color-cop-blue)]/5 font-semibold' : ''}`}
                                            onClick={() => handleSelect(club.id)}
                                        >
                                            <div className="w-5 flex justify-center">
                                                {selected === club.id ? <Check size={16} strokeWidth={2} className="text-[var(--color-cop-blue)]" /> : <Building2 size={16} className="text-slate-400 group-hover:text-[var(--color-cop-blue)]" />}
                                            </div>
                                            <span className="flex-1 text-left truncate">{club.nombre}</span>
                                        </button>
                                        {club.website_url && (
                                            <a
                                                href={club.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-slate-400 hover:text-[var(--color-cop-blue)] hover:bg-blue-50 rounded-full transition-colors"
                                                title="Visitar sitio web oficial"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
