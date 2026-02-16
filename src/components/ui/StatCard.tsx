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
    className
}: StatCardProps) {
    return (
        <div className={cn(
            "group",
            "bg-surface",
            "border border-border-elite",
            "rounded-elite-lg", // 16px
            "p-6",
            "shadow-elite-sm",
            "transition-all duration-normal",
            "hover:shadow-elite-md hover:-translate-y-0.5",
            className
        )}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    {label}
                </span>
                <div className={cn(
                    "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                    iconBg
                )}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>

            <p className="text-2xl font-bold text-text-elite leading-tight tracking-elite">
                {value}
            </p>

            {(description || trend) && (
                <div className="flex items-center gap-1 mt-2">
                    {trend && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-status-success">
                            {trend}
                        </span>
                    )}
                    {description && (
                        <p className="text-xs text-text-muted font-medium">
                            {description}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
