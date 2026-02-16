'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, type LucideIcon } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
    color?: string; // Optional color dot
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

    const selectedOption = options.find(opt => opt.value === value);

    // Helper to determine if we are in "all" or "default" state
    const isDefault = value === 'todos' || value === 'todas' || value === '';

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className={`filter-trigger ${isOpen ? 'active' : ''} !min-w-[200px] !justify-between`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3 truncate">
                    {/* Icon - fades out when selection is active, optional style choice */}
                    <Icon size={16} className={`text-slate-400 ${!isDefault ? 'text-blue-600' : ''}`} />

                    <span className={`truncate ${!isDefault ? 'text-slate-900' : 'text-slate-500'}`}>
                        {selectedOption ? selectedOption.label : label}
                    </span>
                </div>

                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${!isDefault ? 'text-blue-600' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="filter-dropdown-menu absolute top-full left-0 mt-2 bg-surface border border-border-elite rounded-elite-md shadow-elite-xl z-[100] min-w-[220px] overflow-hidden animate-dropdown-fade">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`dropdown-item flex items-center justify-between w-full px-4 py-2.5 text-sm text-text-secondary hover:bg-blue-50/50 hover:text-cop-blue transition-colors ${value === option.value ? 'selected bg-blue-50/50 text-cop-blue font-semibold' : ''}`}
                        >
                            <div className="flex items-center gap-2.5">
                                {option.color && (
                                    <span
                                        className="w-2 h-2 rounded-full ring-1 ring-inset ring-black/5"
                                        style={{ backgroundColor: option.color }}
                                    />
                                )}
                                {option.label}
                            </div>

                            {value === option.value && (
                                <Check size={14} className="text-blue-600 ml-auto" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
