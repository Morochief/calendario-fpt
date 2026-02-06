'use client';

import { useState, useRef, useEffect } from 'react';
import { Modalidad } from '@/lib/types';

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedModality ? (
                        <>
                            <span
                                className="dot"
                                style={{
                                    background: selectedModality.color,
                                    width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block'
                                }}
                            />
                            {selectedModality.nombre}
                        </>
                    ) : (
                        <>
                            <span>🔍</span>
                            Filtrar por Modalidad
                        </>
                    )}
                </div>

                {/* Chevron Icon */}
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.5
                    }}
                >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <div className="filter-dropdown-menu">
                    <button
                        className={`dropdown-item ${selected === null ? 'selected' : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <span>👁️</span>
                        Ver Todas
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
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
