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
        primary: "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-900/20 border-transparent hover:shadow-blue-900/30",
        secondary: "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300",
        danger: "bg-white text-red-600 border-red-100 shadow-sm hover:bg-red-50 hover:border-red-200",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent shadow-none"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || disabled}
            className={`
                relative inline-flex items-center justify-center
                px-4 py-2.5 rounded-xl
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
