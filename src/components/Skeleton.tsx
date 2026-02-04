'use client';

/**
 * Loading Skeleton Components
 * Provides visual feedback during data loading
 */

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    borderRadius = '4px',
    className = ''
}: SkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{ width, height, borderRadius }}
            aria-busy="true"
            aria-label="Cargando..."
        />
    );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="skeleton-row">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i}>
                    <Skeleton height="1.5rem" width={i === 0 ? '80px' : i === columns - 1 ? '120px' : '100%'} />
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </>
    );
}

export function CardSkeleton() {
    return (
        <div className="skeleton-card">
            <Skeleton height="1.25rem" width="40%" className="mb-2" />
            <Skeleton height="0.875rem" width="60%" className="mb-1" />
            <Skeleton height="0.875rem" width="80%" className="mb-1" />
            <Skeleton height="0.875rem" width="50%" />
        </div>
    );
}

export function FormSkeleton() {
    return (
        <div className="skeleton-form">
            <div className="skeleton-form-group">
                <Skeleton height="1rem" width="30%" className="mb-2" />
                <Skeleton height="2.5rem" width="100%" />
            </div>
            <div className="skeleton-form-row">
                <div className="skeleton-form-group">
                    <Skeleton height="1rem" width="40%" className="mb-2" />
                    <Skeleton height="2.5rem" width="100%" />
                </div>
                <div className="skeleton-form-group">
                    <Skeleton height="1rem" width="35%" className="mb-2" />
                    <Skeleton height="2.5rem" width="100%" />
                </div>
            </div>
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="skeleton-calendar">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton-month">
                    <Skeleton height="1.5rem" width="60%" className="mb-3" />
                    <Skeleton height="150px" width="100%" borderRadius="8px" />
                </div>
            ))}
        </div>
    );
}
