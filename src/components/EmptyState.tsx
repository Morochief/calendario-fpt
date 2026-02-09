'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
}

/**
 * Empty State Component
 * Shows a friendly message when there's no data
 * Optionally provides a call-to-action
 */
export default function EmptyState({
    icon = <Inbox size={48} className="text-gray-300" />,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="empty-state" role="status" aria-label={title}>
            <div className="empty-state-icon" aria-hidden="true">
                {icon}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            {description && (
                <p className="empty-state-description">{description}</p>
            )}
            {(actionLabel && (actionHref || onAction)) && (
                actionHref ? (
                    <Link href={actionHref} className="btn btn-primary empty-state-action">
                        {actionLabel}
                    </Link>
                ) : (
                    <button
                        onClick={onAction}
                        className="btn btn-primary empty-state-action"
                    >
                        {actionLabel}
                    </button>
                )
            )}
        </div>
    );
}

/**
 * Selector Empty State
 * Shows when a required select has no options
 */
export function SelectEmptyState({
    entityName,
    createHref
}: {
    entityName: string;
    createHref: string;
}) {
    return (
        <div className="select-empty-state">
            <span className="select-empty-icon">
                <AlertTriangle size={16} />
            </span>
            <span>No hay {entityName} disponibles.</span>
            <Link href={createHref} className="select-empty-link">
                Crear {entityName}
            </Link>
        </div>
    );
}
