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
        <nav className="pagination" aria-label="Paginación">
            {totalItems && (
                <span className="pagination-info" aria-live="polite">
                    Mostrando {startItem}-{endItem} de {totalItems}
                </span>
            )}

            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    ←
                </button>

                {getVisiblePages().map((page, index) => (
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis" aria-hidden="true">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                            aria-current={currentPage === page ? 'page' : undefined}
                            aria-label={`Página ${page}`}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    className="pagination-btn"
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
