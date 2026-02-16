import React from 'react';

type TitleType = 'institucional' | 'competencia' | 'minimal';

interface SectionTitleProps {
    title: string;
    type?: TitleType;
    subtitle?: string;
    className?: string;
}

export default function SectionTitle({ title, type = 'institucional', subtitle, className = '' }: SectionTitleProps) {
    const colorClasses = {
        institucional: "text-cop-blue border-l-4 border-fpt-red pl-4",
        competencia: "text-fpt-red font-bold tracking-tight",
        minimal: "text-text-secondary"
    };

    return (
        <div className={`mb-6 ${className}`}>
            <h2 className={`text-2xl md:text-3xl font-bold ${colorClasses[type]} transition-colors duration-300`}>
                {title}
            </h2>
            {subtitle && (
                <p className="mt-2 text-text-secondary text-sm md:text-base font-medium opacity-80">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
