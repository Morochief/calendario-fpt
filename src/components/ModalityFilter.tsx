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
        <div className="filter-container" ref={dropdownRef}>
            <button
                className={`filter-trigger ${selected ? 'active' : ''}`}
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
                <div className="filter-dropdown-menu">
                    <button
                        className={`dropdown-item ${selected === null ? 'selected' : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <div style={{ width: '18px', display: 'flex', justifyContent: 'center' }}>
                            {selected === null && <Check size={13} strokeWidth={1.5} />}
                        </div>
                        Todas las modalidades
                    </button>

                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0.25rem 0' }} />

                    {modalidades.map((mod) => (
                        <button
                            key={mod.id}
                            className={`dropdown-item ${selected === mod.id ? 'selected' : ''}`}
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
