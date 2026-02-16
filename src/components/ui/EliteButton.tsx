'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface EliteButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    isLoading?: boolean;
    icon?: ReactNode;
}

export default function EliteButton({
    children,
    variant = 'primary',
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props
}: EliteButtonProps) {

    const variants = {
        primary: "bg-blue-600 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20",
        secondary: "bg-white text-slate-700 border-2 border-slate-200 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 hover:bg-slate-50 hover:border-slate-300 transition-all",
        danger: "bg-white text-red-600 border-2 border-red-100 border-b-4 border-red-200 active:border-b-0 active:translate-y-1 hover:bg-red-50 hover:border-red-200 transition-all",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent shadow-none"
    };

    return (
        <motion.button
            disabled={isLoading || disabled}
            className={`
                relative inline-flex items-center justify-center
                px-4 py-2.5 rounded-lg
                font-semibold text-sm transition-all duration-200
                border
                disabled:opacity-70 disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {!isLoading && icon && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
        </motion.button>
    );
}
