import React from 'react';
import { Target } from 'lucide-react';

interface ShooterCardProps {
    name: string;
    division: string;
    category: string;
    club: string;
}

export default function ShooterCard({ name, division, category, club }: ShooterCardProps) {
    return (
        <div className="bg-surface rounded-elite-md border border-border-elite flex flex-col gap-2 p-6 transition-all duration-250 ease-smooth hover:shadow-elite-md hover:-translate-y-0.5 hover:border-border-hover">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-[38px] h-[38px] bg-blue-50 rounded-full flex items-center justify-center text-cop-blue">
                    <Target size={18} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="m-0 text-[0.9375rem] font-semibold text-text-elite tracking-[-0.01em]">{name}</h3>
                    <span className="text-xs text-text-muted">Tirador FPT</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[0.8125rem]">
                <div>
                    <span className="block text-text-muted text-[0.6875rem] uppercase tracking-[0.04em] mb-0.5">División</span>
                    <span className="text-text-elite font-medium">{division}</span>
                </div>
                <div>
                    <span className="block text-text-muted text-[0.6875rem] uppercase tracking-[0.04em] mb-0.5">Categoría</span>
                    <span className="text-text-elite font-medium">{category}</span>
                </div>
                <div className="col-span-2">
                    <span className="block text-text-muted text-[0.6875rem] uppercase tracking-[0.04em] mb-0.5">Club</span>
                    <span className="text-text-elite font-medium">{club}</span>
                </div>
            </div>
        </div>
    );
}
