import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

/**
 * Pagination Component - Elite Minimalist Version
 * Handles navigation with premium animations and institutional palette.
 */
export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage = 10,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getVisiblePages = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);
        if (currentPage > 3) pages.push('ellipsis');

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) pages.push('ellipsis');
        pages.push(totalPages);

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

    return (
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-2" aria-label="Paginación">
            {totalItems && (
                <div className="flex items-center gap-2 text-sm text-slate-500 font-bold animate-fade-in">
                    <span>Mostrando</span>
                    <span className="flex items-center gap-1">
                        <span className="text-cop-blue font-black px-2.5 py-1 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">{startItem}-{endItem}</span>
                    </span>
                    <span>de</span>
                    <span className="text-fpt-red font-black px-2.5 py-1 bg-red-50 rounded-lg border border-red-100 shadow-sm">{totalItems}</span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-cop-blue transition-all hover:border-cop-blue hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-900/5 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed group"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={20} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>

                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-inner">
                    <AnimatePresence mode="popLayout">
                        {getVisiblePages().map((page, index) => (
                            page === 'ellipsis' ? (
                                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-slate-400 font-black tracking-widest text-xs select-none" aria-hidden="true">
                                    •••
                                </span>
                            ) : (
                                <motion.button
                                    key={page}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black transition-all ${currentPage === page
                                        ? 'bg-[#1E3A8A] text-white shadow-lg shadow-blue-900/40'
                                        : 'text-[#1E3A8A] hover:text-[#D91E18] hover:bg-white hover:shadow-md hover:border hover:border-red-100'
                                        }`}
                                    onClick={() => onPageChange(page)}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    aria-label={`Página ${page}`}
                                >
                                    {page}
                                    {currentPage === page && (
                                        <motion.div
                                            layoutId="pageHighlight"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-[#D91E18] rounded-full shadow-sm shadow-red-500/50"
                                        />
                                    )}
                                </motion.button>
                            )
                        ))}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-cop-blue transition-all hover:border-cop-blue hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-900/5 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed group"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                >
                    <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
            </div>
        </nav>
    );
}
