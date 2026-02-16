'use client';

import React, { useState } from 'react';
import { Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubCardProps {
    abbreviation: string;
    name: string;
    color: string;
}

export default function ClubCard({ abbreviation, name, color }: ClubCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={cn(
                "group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6",
                "border border-slate-100 shadow-sm",
                "transition-all duration-300",
                "flex flex-col justify-between overflow-hidden h-full",
                isHovered ? "shadow-xl -translate-y-1" : ""
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Top Border Accent - Animated */}
            <div
                className="absolute top-0 left-0 w-full h-1 transform transition-transform duration-300 origin-left"
                style={{
                    background: color,
                    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)'
                }}
            />

            <div>
                {/* Icon Container */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border"
                    style={{
                        backgroundColor: isHovered ? color : `${color}10`,
                        borderColor: isHovered ? color : `${color}30`,
                        color: isHovered ? '#FFFFFF' : color,
                    }}
                >
                    <Building2 size={24} strokeWidth={1.5} />
                </div>

                <h3
                    className="tex-lg font-bold text-slate-800 leading-tight tracking-tight mb-2 transition-colors duration-300"
                    style={{ color: isHovered ? color : undefined }}
                >
                    {abbreviation}
                </h3>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide leading-snug">
                    {name}
                </p>
            </div>

            {/* Status / Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 opacity-80">
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: color }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Afiliado
                    </span>
                </div>
            </div>
        </div>
    );
}
