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
                                className="dot"
                                style={{
                                    background: selectedModality.color,
                                    width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block'
                                }}
                            />
                            {selectedModality.nombre}
                        </>
                    ) : (
                        <>
                            <Filter size={18} className="text-gray-500" />
                            <span>Explorar por Modalidad</span>
                        </>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.5
                    }}
                />
            </button>

            {isOpen && (
                <div className="filter-dropdown-menu">
                    <button
                        className={`dropdown-item ${selected === null ? 'selected' : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                            {selected === null && <Check size={14} />}
                        </div>
                        Todas las modalidades
                    </button>

                    <div style={{ height: '1px', background: 'rgba(0,0,0,0.05)', margin: '0.25rem 0' }} />

                    {modalidades.map((mod) => (
                        <button
                            key={mod.id}
                            className={`dropdown-item ${selected === mod.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(mod.id)}
                        >
                            <span
                                className="dot"
                                style={{ background: mod.color }}
                            />
                            {mod.nombre}
                            {selected === mod.id && (
                                <div style={{ marginLeft: 'auto' }}>
                                    <Check size={14} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
