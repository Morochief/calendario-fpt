---
description: How to create a new Admin Module with the Elite Minimalist Theme
---

# Create New Admin Module

Follow these steps to create a new module (e.g., `/admin/premios`) that aligns with the Elite Minimalist design system.

## 1. Create Page Component
Create `src/app/admin/[module-name]/page.tsx`.

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs'; // Uses Tailwind now
import { Plus, ArrowLeft, Search, Edit2, Trash2, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function AdminModulePage() {
    // State ...

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Breadcrumbs />

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1E3A8A]">Module Title</h1> {/* Institutional Blue */}
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-1"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D91E18] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            Nuevo Item {/* FPT Red Button */}
                        </button>
                    </div>

                    {/* List Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="px-6 py-4 border-b border-slate-200">
                             <h3 className="text-lg font-medium text-[#1E3A8A]">Listado</h3>
                        </div>
                        {/* Table Content ... */}
                    </div>
                </div>
            </main>
        </div>
    );
}
```

## 2. Key Design Rules
- **Background:** `bg-slate-50` for the page, `bg-white` for cards.
- **Headers:** `text-[#1E3A8A]` (Institutional Blue).
- **Primary Buttons:** `bg-[#D91E18]` (FPT Red).
- **Inputs:** `rounded-lg border-slate-300 focus:ring-blue-500`.
- **Icons:** Use `lucide-react` with `size={16}` for buttons, `size={20}` for section headers.

## 3. Verify
Run `npm run build` to ensure no type errors.
