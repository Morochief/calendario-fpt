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
                className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 min-w-[200px] hover:shadow-md hover:border-blue-300 ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2.5 truncate">
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
                <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full min-w-[200px] bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1.5 origin-top-left">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left mb-0.5 ${value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
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
                                <Check size={14} className="text-blue-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
