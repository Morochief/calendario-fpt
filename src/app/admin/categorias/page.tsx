'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isAllowedAdmin } from '@/lib/utils';
import { Categoria } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    Plus,
    ArrowLeft,
    Edit2,
    Trash2,
    Tag,
    Save
} from 'lucide-react';

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const { showToast } = useToast();

    async function checkAuth() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Check if user is admin
        if (!isAllowedAdmin(user.email)) {
            router.push('/');
            return;
        }

        loadCategorias();
    }

    useEffect(() => {
        checkAuth();
    }, []);

    async function loadCategorias() {
        const supabase = createClient();
        const { data } = await supabase
            .from('categorias')
            .select('*')
            .order('nombre');

        if (data) setCategorias(data);
        setLoading(false);
    }

    // Security: Input Sanitization
    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const categoriaData = {
            nombre: sanitize(nombre),
            descripcion: sanitize(descripcion) || null,
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('categorias').update(categoriaData).eq('id', editingId);
                if (error) throw error;
                showToast('Categoría actualizada correctamente', 'success');
            } else {
                const { error } = await supabase.from('categorias').insert(categoriaData);
                if (error) throw error;
                showToast('Categoría creada correctamente', 'success');
            }

            closeModal();
            await loadCategorias();
        } catch (error) {
            console.error('Error saving categoria:', error);
            showToast('Error al guardar la categoría', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(cat: Categoria) {
        if (!confirm(`¿Estás seguro de eliminar la categoría "${cat.nombre}"?`)) return;

        const supabase = createClient();
        const { error } = await supabase.from('categorias').delete().eq('id', cat.id);

        if (error) {
            console.error('Error deleting categoria:', error);
            showToast('Error al eliminar. Puede que esté en uso.', 'error');
        } else {
            showToast('Categoría eliminada', 'success');
            await loadCategorias();
        }
    }

    const openModal = (cat?: Categoria) => {
        if (cat) {
            setEditingId(cat.id);
            setNombre(cat.nombre);
            setDescripcion(cat.descripcion || '');
        } else {
            setEditingId(null);
            setNombre('');
            setDescripcion('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Categorías</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium mt-2 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        <EliteButton
                            onClick={() => openModal()}
                            icon={<Plus size={18} />}
                        >
                            Nueva Categoría
                        </EliteButton>
                    </div>

                    {/* Content */}
                    <EliteCard title="Listado de Categorías">
                        <EliteTable
                            data={categorias}
                            gridCols="60px 1fr 2fr 100px"
                            keyExtractor={(c) => c.id}
                            header={
                                <>
                                    <EliteHeader align="center">Icono</EliteHeader>
                                    <EliteHeader>Nombre</EliteHeader>
                                    <EliteHeader>Descripción</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(cat) => (
                                <>
                                    <EliteCell align="center">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm mx-auto">
                                            <Tag size={20} />
                                        </div>
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="font-bold text-slate-800 text-sm">{cat.nombre}</span>
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="text-sm text-slate-500 truncate block">
                                            {cat.descripcion || '-'}
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(cat)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </EliteCell>
                                </>
                            )}
                        />
                    </EliteCard>
                </div>
            </main>

            {/* Modal */}
            <EliteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <Tag size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Información de la Categoría
                            </h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Nombre
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Senior, Super Senior"
                                required
                                maxLength={50}
                                className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Descripción
                            </label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                rows={3}
                                maxLength={300}
                                className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 resize-none placeholder:text-slate-400"
                                placeholder="Detalles o requisitos de la categoría..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton type="submit" isLoading={saving} icon={<Save size={16} />}>
                            Guardar
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
