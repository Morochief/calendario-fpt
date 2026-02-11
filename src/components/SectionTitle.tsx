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
        institucional: "text-[#1E3A8A] border-l-4 border-[#D91E18] pl-4", // Blue with Red accent border
        competencia: "text-[#D91E18] font-bold tracking-tight", // Red for High Impact
        minimal: "text-[#475569]" // Neutral slate
    };

    return (
        <div className={`mb-6 ${className}`}>
            <h2 className={`text-2xl md:text-3xl font-bold ${colorClasses[type]} transition-colors duration-300`}>
                {title}
            </h2>
            {subtitle && (
                <p className="mt-2 text-[#475569] text-sm md:text-base font-medium opacity-80">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
