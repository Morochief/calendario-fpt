'use client';

import { Modalidad } from '@/lib/types';

interface ModalityFilterProps {
    modalidades: Modalidad[];
    selected: string | null;
    onSelect: (id: string | null) => void;
}

export default function ModalityFilter({ modalidades, selected, onSelect }: ModalityFilterProps) {
    return (
        <div className="filter-bar">
            <label>Filtrar por modalidad:</label>
            <button
                className={`filter-chip ${selected === null ? 'active' : ''}`}
                onClick={() => onSelect(null)}
            >
                Todas
            </button>
            {modalidades.map((mod) => (
                <button
                    key={mod.id}
                    className={`filter-chip ${selected === mod.id ? 'active' : ''}`}
                    onClick={() => onSelect(mod.id)}
                    style={{
                        borderColor: selected === mod.id ? mod.color : undefined,
                        background: selected === mod.id ? mod.color : undefined,
                    }}
                >
                    <span className="dot" style={{ background: mod.color }} />
                    {mod.nombre}
                </button>
            ))}
        </div>
    );
}
