'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import {
    Plus,
    ArrowLeft,
    Edit2,
    Trash2,
    X,
    Save,
    LayoutGrid,
    Tag
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

    useEffect(() => {
        loadCategorias();
    }, []);

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
            } else {
                await supabase.from('categorias').insert(categoriaData);
            }

            resetForm();
            await loadCategorias();
        } catch (error) {
            console.error('Error saving categoria:', error);
            alert('Error al guardar la categoría');
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
            console.error('Error deleting categoria:', error);
            alert('Error al eliminar.');
        } else {
            await loadCategorias();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9FBFF] flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FBFF] flex flex-col font-sans text-[#1E3A8A]">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-6">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1E3A8A]">Categorías</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mt-1"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D91E18] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Nueva Categoría
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden">
                            <div className="border-b border-slate-300 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#1E3A8A]">
                                    {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre de la categoría</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Senior"
                                            required
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
                                        <textarea
                                            id="descripcion"
                                            value={descripcion}
                                            onChange={(e) => setDescripcion(e.target.value)}
                                            rows={3}
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Detalles sobre esta categoría..."
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D91E18] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                                        >
                                            {saving ? 'Guardando...' : (
                                                <>
                                                    <Save size={16} className="mr-2" />
                                                    Guardar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-300">
                            <h3 className="text-lg font-medium text-[#1E3A8A]">Listado de Categorías</h3>
                        </div>

                        {categorias.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <Tag size={32} className="text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 mb-1">No hay categorías</p>
                                <p>Crea la primera categoría para organizar a los participantes.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {categorias.map((categoria) => (
                                    <div key={categoria.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                <Tag size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-slate-900">{categoria.nombre}</h4>
                                                {categoria.descripcion && (
                                                    <p className="mt-1 text-sm text-slate-500">{categoria.descripcion}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:self-center self-end">
                                            <button
                                                onClick={() => handleEdit(categoria)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(categoria.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
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
