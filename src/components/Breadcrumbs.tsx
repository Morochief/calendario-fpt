'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    icon?: React.ReactNode;
    href?: string;
}

const ROUTES: Record<string, BreadcrumbItem> = {
    '/admin': { label: 'Panel', href: '/admin' },
    '/admin/eventos': { label: 'Eventos' },
    '/admin/eventos/nuevo': { label: 'Nuevo Evento' },
    '/admin/modalidades': { label: 'Modalidades' },
    '/admin/tipos-evento': { label: 'Tipos de Evento' },
    '/admin/inscripciones': { label: 'Inscripciones' },
    '/admin/clubes': { label: 'Clubes' },
};

interface BreadcrumbsProps {
    className?: string;
}

export default function Breadcrumbs({ className }: BreadcrumbsProps) {
    const pathname = usePathname();

    // Generate breadcrumb items from current path
    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [{ label: 'Inicio', icon: <Home size={14} />, href: '/' }];

        if (!pathname.startsWith('/admin')) {
            return items;
        }

        // Add admin root
        items.push({ label: 'Admin', icon: <Settings size={14} />, href: '/admin' });

        // Check for known routes
        const route = ROUTES[pathname];
        if (route && pathname !== '/admin') {
            items.push({ label: route.label });
        } else if (pathname.startsWith('/admin/eventos/') && pathname !== '/admin/eventos/nuevo') {
            // Dynamic event edit page
            items.push({ label: 'Editar Evento' });
        }

        return items;
    };

    const breadcrumbs = getBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className={cn("mb-4", className)}>
            <ol className="flex items-center flex-wrap gap-2 text-sm text-text-muted">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {!isLast && item.href ? (
                                <>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-1 hover:text-cop-blue transition-colors"
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </Link>
                                    <ChevronRight size={14} className="text-border-elite" />
                                </>
                            ) : (
                                <span className="flex items-center gap-1 font-medium text-text-elite">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
