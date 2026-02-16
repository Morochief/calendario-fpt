'use client';

import { useState, useRef, useEffect } from 'react';
import { Modalidad } from '@/lib/types';
import { Filter, Check, ChevronDown } from 'lucide-react';

interface ModalityFilterProps {
    modalidades: Modalidad[];
    selected: string | null;
    onSelect: (id: string | null) => void;
}

export default function ModalityFilter({ modalidades, selected, onSelect }: ModalityFilterProps) {
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

    const selectedModality = modalidades.find(m => m.id === selected);

    const handleSelect = (id: string | null) => {
        onSelect(id);
        setIsOpen(false);
    };

    return (
        <div className="sticky top-[80px] z-[var(--z-filter)] flex py-2 pointer-events-none mb-10" ref={dropdownRef}>
            <button
                className={`pointer-events-auto flex items-center justify-between gap-4 px-4 py-2.5 bg-surface border border-border-elite rounded-elite-sm font-medium text-sm text-text-elite cursor-pointer shadow-elite-xs transition-all hover:border-border-hover hover:shadow-elite-sm active:scale-98 min-w-[240px] ${selected ? 'border-border-hover shadow-[0_0_0_3px_rgba(30,58,138,0.08)]' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selectedModality ? (
                        <>
                            <span
                                style={{
                                    background: selectedModality.color,
                                    width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block'
                                }}
                            />
                            {selectedModality.nombre}
                        </>
                    ) : (
                        <>
                            <Filter size={16} strokeWidth={1.5} style={{ color: '#A3A3A3' }} />
                            <span>Explorar por Modalidad</span>
                        </>
                    )}
                </div>

                <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.35
                    }}
                />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+6px)] left-0 bg-surface border border-border-elite rounded-elite-md shadow-elite-xl p-1.5 min-w-[260px] max-h-[60vh] overflow-y-auto pointer-events-auto z-[var(--z-dropdown)] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all border-none bg-transparent w-full text-left text-[13px] text-text-elite hover:bg-cop-blue/5 hover:translate-x-0.5 active:translate-x-0.5 active:scale-98 ${selected === null ? 'bg-cop-blue/5 font-semibold' : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <div style={{ width: '18px', display: 'flex', justifyContent: 'center' }}>
                            {selected === null && <Check size={13} strokeWidth={1.5} />}
                        </div>
                        Todas las modalidades
                    </button>

                    <div className="h-px bg-black/5 my-1" />

                    {modalidades.map((mod) => (
                        <button
                            key={mod.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all border-none bg-transparent w-full text-left text-[13px] text-text-elite hover:bg-cop-blue/5 hover:translate-x-0.5 active:translate-x-0.5 active:scale-98 ${selected === mod.id ? 'bg-cop-blue/5 font-semibold' : ''}`}
                            onClick={() => handleSelect(mod.id)}
                        >
                            <span
                                className="dot"
                                style={{ background: mod.color, width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' }}
                            />
                            {mod.nombre}
                            {selected === mod.id && (
                                <div style={{ marginLeft: 'auto' }}>
                                    <Check size={13} strokeWidth={1.5} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
