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
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-transparent",
        secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-sm border border-transparent",
        danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent shadow-none"
    };

    return (
        <motion.button
            disabled={isLoading || disabled}
            className={`
                relative inline-flex items-center justify-center
                px-4 py-2 rounded-md
                font-medium text-sm transition-colors duration-200
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
