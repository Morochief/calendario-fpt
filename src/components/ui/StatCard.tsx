'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    trend?: string;
    description?: string;
    iconColor?: string; // e.g. "text-cop-blue"
    iconBg?: string; // e.g. "bg-blue-50"
    trendColor?: string; // e.g. "text-emerald-600"
    trendBg?: string; // e.g. "bg-emerald-50"
    className?: string;
}

export default function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    description,
    iconColor = "text-cop-blue",
    iconBg = "bg-blue-50",
    trendColor = "text-emerald-600",
    trendBg = "bg-emerald-50",
    className
}: StatCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden",
            "bg-white/90 backdrop-blur-sm",
            "border border-white/20",
            "rounded-2xl",
            "p-6",
            "shadow-lg shadow-slate-200/50",
            "transition-all duration-300 ease-out",
            "hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1",
            className
        )}>
            {/* Top Gradient Accent */}
            <div className={cn(
                "absolute top-0 left-0 w-full h-1",
                "bg-gradient-to-r from-transparent via-cop-blue/50 to-transparent",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )} />

            {/* Background Glow */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {label}
                </span>
                <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                    "ring-1 ring-inset ring-black/5",
                    iconBg
                )}>
                    <Icon size={18} className={iconColor} strokeWidth={2} />
                </div>
            </div>

            <p className="relative z-10 text-3xl font-bold text-slate-800 tracking-tight">
                {value}
            </p>

            {(description || trend) && (
                <div className="relative z-10 flex items-center gap-2 mt-3">
                    {trend && (
                        <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            trendBg,
                            trendColor,
                            trendColor.replace('text-', 'border-').replace('600', '100') // Basic border color derivation or just let it inherit/be static
                        )}>
                            {trend}
                        </span>
                    )}
                    {description && (
                        <p className="text-xs text-slate-400 font-medium truncate">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
