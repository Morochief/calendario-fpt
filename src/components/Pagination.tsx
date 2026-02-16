'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
}

/**
 * Pagination Component
 * Handles navigation between pages of data
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

        // Always show first page
        pages.push(1);

        if (currentPage > 3) {
            pages.push('ellipsis');
        }

        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push('ellipsis');
        }

        // Always show last page
        pages.push(totalPages);

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

    return (
        <nav className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2" aria-label="Paginación">
            {totalItems && (
                <span className="text-sm text-text-muted font-medium" aria-live="polite">
                    Mostrando <span className="text-text-elite font-bold">{startItem}-{endItem}</span> de <span className="text-text-elite font-bold">{totalItems}</span>
                </span>
            )}

            <div className="flex items-center gap-1.5">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-elite-sm text-text-secondary transition-all hover:bg-slate-100 hover:text-cop-blue disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed active:scale-95"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    ←
                </button>

                {getVisiblePages().map((page, index) => (
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9 text-text-muted select-none" aria-hidden="true">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`flex items-center justify-center w-9 h-9 rounded-elite-sm text-sm font-semibold transition-all shadow-sm active:scale-95 ${currentPage === page
                                    ? 'bg-cop-blue text-white shadow-elite-sm hover:shadow-elite-md'
                                    : 'bg-white text-text-secondary border border-border-elite hover:border-cop-blue hover:text-cop-blue'
                                }`}
                            onClick={() => onPageChange(page)}
                            aria-current={currentPage === page ? 'page' : undefined}
                            aria-label={`Página ${page}`}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    className="flex items-center justify-center w-9 h-9 rounded-elite-sm text-text-secondary transition-all hover:bg-slate-100 hover:text-cop-blue disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed active:scale-95"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                >
                    →
                </button>
            </div>
        </nav>
    );
}
