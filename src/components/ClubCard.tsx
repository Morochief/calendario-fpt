import React from 'react';
import { Building2 } from 'lucide-react';

interface ClubCardProps {
    abbreviation: string;
    name: string;
    color: string;
}

export default function ClubCard({ abbreviation, name, color }: ClubCardProps) {
    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-slate-100"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="p-6 flex flex-col gap-3">
                {/* Header Row */}
                <div className="flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300"
                        style={{
                            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                            border: `1px solid ${color}30`,
                        }}
                    >
                        <Building2 size={24} style={{ color }} />
                    </div>
                    <div>
                        <h3 className="tex-lg font-bold text-[#1E3A8A] leading-tight tracking-tight">
                            {abbreviation}
                        </h3>
                        <p className="text-sm text-slate-500 leading-snug">
                            {name}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <div
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full border"
                    style={{
                        background: `${color}08`,
                        borderColor: `${color}20`,
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color }}
                    >
                        Club Afiliado
                    </span>
                </div>
            </div>
        </div>
    );
}
