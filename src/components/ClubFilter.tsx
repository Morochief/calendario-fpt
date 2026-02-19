
import { useState, useRef, useEffect } from 'react';
import { Club } from '@/lib/types';
import { Filter, Check, ChevronDown, X, Building2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClubFilterProps {
    clubes: Club[];
    selected: string | null;
    onSelect: (id: string | null) => void;
}

export default function ClubFilter({ clubes, selected, onSelect }: ClubFilterProps) {
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
        <div className="sticky top-[80px] z-[var(--z-filter)] flex py-4 pointer-events-none mb-4 justify-start" ref={dropdownRef}>
            <div className="relative pointer-events-auto">
                <button
                    className={`flex items-center justify-between gap-4 px-6 py-3 bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-full font-semibold text-sm text-[var(--color-text)] cursor-pointer shadow-[var(--shadow-md)] transition-all duration-300 hover:border-[var(--color-cop-blue)] hover:shadow-[var(--shadow-lg)] active:scale-98 min-w-[280px] group ${isOpen ? 'ring-2 ring-[var(--color-cop-blue)]/10 border-[var(--color-cop-blue)]' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        {selectedClub ? (
                            <>
                                <Building2 size={18} strokeWidth={1.5} className="text-[var(--color-cop-blue)]" />
                                <span className="text-[var(--color-text)] truncate max-w-[180px]">{selectedClub.nombre}</span>
                            </>
                        ) : (
                            <>
                                <Building2 size={18} strokeWidth={1.5} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-cop-blue)] transition-colors" />
                                <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">Filtrar por Club</span>
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
                            size={16}
                            strokeWidth={1.5}
                            className={`text-[var(--color-text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-cop-blue)]' : ''}`}
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
