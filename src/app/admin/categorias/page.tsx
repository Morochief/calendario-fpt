'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useToast } from '@/components/Toast';
import { createClient } from '@/lib/supabase';
import {
    Plus,
    ArrowLeft,
    Edit2,
    Trash2,
    X,
    Save,
    Tag,
    Loader2
} from 'lucide-react';
import { Categoria } from '@/lib/types';

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        checkAuthAndLoad();
    }, []);

    async function checkAuthAndLoad() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        await loadCategorias();
    }

    async function loadCategorias() {
        const supabase = createClient();
        const { data } = await supabase
            .from('categorias')
            .select('*')
            .order('nombre');

        if (data) {
            setCategorias(data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const categoriaData = {
            nombre,
            descripcion: descripcion || null,
        };

        try {
            if (editingId) {
                await supabase.from('categorias').update(categoriaData).eq('id', editingId);
                showToast('Categoría actualizada', 'success');
            } else {
                await supabase.from('categorias').insert(categoriaData);
                showToast('Categoría creada', 'success');
            }

            resetForm();
            await loadCategorias();
        } catch {
            showToast('Error al guardar la categoría', 'error');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setNombre('');
        setDescripcion('');
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(categoria: Categoria) {
        setEditingId(categoria.id);
        setNombre(categoria.nombre);
        setDescripcion(categoria.descripcion || '');
        setShowForm(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        const supabase = createClient();
        const { error } = await supabase.from('categorias').delete().eq('id', id);

        if (error) {
            showToast('Error al eliminar la categoría', 'error');
        } else {
            showToast('Categoría eliminada', 'success');
            await loadCategorias();
        }
    }

    const labelStyle = "block text-sm font-medium text-text-elite mb-1.5";
    const inputStyle = "block w-full rounded-elite-sm border-border-elite shadow-elite-xs focus:border-cop-blue focus:ring-1 focus:ring-cop-blue/20 sm:text-sm py-2.5 transition-all text-text-secondary bg-surface hover:border-border-hover";

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-elite flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 size={48} className="text-cop-blue animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 animate-page-enter">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Breadcrumbs />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-elite tracking-tight">Categorías</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-cop-blue transition-colors mt-1"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95"
                            >
                                <Plus size={16} />
                                Nueva Categoría
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-surface rounded-xl shadow-elite-sm border border-border-elite overflow-hidden animate-in fade-in duration-300">
                            <div className="border-b border-border-elite px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-elite">
                                    {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="text-text-muted hover:text-text-elite transition-colors p-1 rounded-lg hover:bg-bg-elite"
                                    aria-label="Cerrar formulario"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className={labelStyle}>Nombre de la categoría</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Senior"
                                            required
                                            maxLength={50}
                                            className={inputStyle}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="descripcion" className={labelStyle}>Descripción (opcional)</label>
                                        <textarea
                                            id="descripcion"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            rows={3}
                                            maxLength={300}
                                            className={`${inputStyle} resize-y`}
                                            placeholder="Detalles sobre esta categoría..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-border-elite">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="btn btn-secondary shadow-elite-xs"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : (
                                                <>
                                                    <Save size={16} />
                                                    Guardar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="bg-surface rounded-xl shadow-elite-sm border border-border-elite overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-elite">
                            <h3 className="text-lg font-semibold text-text-elite">Listado de Categorías</h3>
                        </div>

                        {categorias.length === 0 ? (
                            <div className="p-12 text-center text-text-secondary">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elite mb-4">
                                    <Tag size={32} className="text-text-muted" />
                                </div>
                                <p className="text-lg font-medium text-text-elite mb-1">No hay categorías</p>
                                <p>Crea la primera categoría para organizar a los participantes.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-elite">
                                {categorias.map((categoria) => (
                                    <div key={categoria.id} className="p-4 sm:p-6 hover:bg-bg-elite transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Tag size={20} className="text-cop-blue" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-text-elite">{categoria.nombre}</h4>
                                                {categoria.descripcion && (
                                                    <p className="mt-1 text-sm text-text-secondary">{categoria.descripcion}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:self-center self-end">
                                            <button
                                                onClick={() => handleEdit(categoria)}
                                                className="p-2 text-text-muted hover:text-cop-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                                aria-label={`Editar categoría ${categoria.nombre}`}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(categoria.id)}
                                                className="p-2 text-text-muted hover:text-fpt-red hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                                aria-label={`Eliminar categoría ${categoria.nombre}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
