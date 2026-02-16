'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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

    // ✅ CORREGIDO: Variantes usando CSS variables del globals.css
    const variants = {
        primary: "bg-[var(--color-fpt-red)] text-white hover:bg-[#c41a15] border-transparent shadow-[0_2px_8px_rgba(217,30,24,0.3)]",
        secondary: "bg-white text-[var(--color-text)] border-[var(--color-border)] hover:bg-[rgba(30,58,138,0.02)] hover:border-[var(--color-border-hover)] shadow-[var(--shadow-xs)]",
        danger: "bg-white text-[var(--color-error)] border-[rgba(217,30,24,0.2)] hover:bg-[#FEF2F2] hover:border-[rgba(217,30,24,0.3)] shadow-sm",
        ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[rgba(30,58,138,0.04)] border-transparent shadow-none"
    };

    return (
        <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading || disabled}
            className={cn(
                // Base styles
                "relative inline-flex items-center justify-center",
                "px-4 py-2.5 rounded-[var(--radius-sm)]",
                "font-medium text-sm transition-all duration-200",
                "border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-cop-blue)]",
                // Disabled state - ✅ SIN DUPLICAR
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                // Variant
                variants[variant],
                className
            )}
            {...props}
        >
            {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {!isLoading && icon && (
                <span className="mr-2 flex items-center">{icon}</span>
            )}
            <span>{children}</span>
        </motion.button>
    );
}
