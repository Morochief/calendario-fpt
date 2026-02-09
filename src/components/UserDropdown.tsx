'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
    email: string | undefined;
    onLogout: () => void;
}

export default function UserDropdown({ email, onLogout }: UserDropdownProps) {
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

    // Extract initial for avatar
    const initial = email ? email[0].toUpperCase() : 'A';

    return (
        <div className="user-dropdown-container" ref={dropdownRef}>
            <button
                className={`user-dropdown-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Menú de usuario"
            >
                <div className="user-avatar">
                    {initial}
                </div>
                <span className="user-email">{email}</span>
                <span className="user-chevron">
                    <ChevronDown size={14} />
                </span>
            </button>

            {isOpen && (
                <div className="user-dropdown-menu" role="menu">
                    <div className="user-dropdown-header">
                        <span className="user-dropdown-label">Conectado como</span>
                        <span className="user-dropdown-email">{email}</span>
                    </div>
                    <div className="user-dropdown-divider" />
                    <Link href="/admin" className="user-dropdown-item" role="menuitem" onClick={() => setIsOpen(false)}>
                        <Settings size={16} />
                        Panel Admin
                    </Link>
                    <button
                        className="user-dropdown-item danger"
                        onClick={() => {
                            setIsOpen(false);
                            onLogout();
                        }}
                        role="menuitem"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}
