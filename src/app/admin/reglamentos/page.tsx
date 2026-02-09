'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { Plus, Save, Trash2, FileText, ArrowLeft, Upload, X } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface Reglamento {
    id: string;
    titulo: string;
    url: string;
    created_at: string;
}

export default function ReglamentosPage() {
    const [reglamentos, setReglamentos] = useState<Reglamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const router = useRouter();

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

        loadReglamentos();
    }

    async function loadReglamentos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('reglamentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) {
            setReglamentos(data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !titulo) return;

        setUploading(true);
        const supabase = createClient();

        try {
            // 1. Upload file to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reglamentos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('reglamentos')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('reglamentos')
                .insert({
                    titulo,
                    url: publicUrl
                });

            if (dbError) throw dbError;

            // Success
            resetForm();
            loadReglamentos();
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir el reglamento. Verifica que el bucket "reglamentos" exista y tenga políticas públicas.');
        } finally {
            setUploading(false);
        }
    }

    function resetForm() {
        setTitulo('');
        setFile(null);
        setShowForm(false);
    }

    async function handleDelete(id: string, url: string) {
        if (!confirm('¿Eliminar este reglamento?')) return;

        const supabase = createClient();

        // Extract filename from URL to delete from storage
        // URL format: .../reglamentos/filename.pdf
        const fileName = url.split('/').pop();

        if (fileName) {
            await supabase.storage
                .from('reglamentos')
                .remove([fileName]);
        }

        await supabase.from('reglamentos').delete().eq('id', id);
        loadReglamentos();
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Gestión de Reglamentos</h2>
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
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                <Plus size={18} />
                                Nuevo Reglamento
                            </button>
                        )}
                    </div>

                    {/* Upload Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-slate-900">Nuevo Reglamento</h3>
                                <button
                                    onClick={resetForm}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-1">
                                        Título del Reglamento *
                                    </label>
                                    <input
                                        id="titulo"
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        placeholder="Ej: Reglamento Técnico IPSC 2024"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">
                                        Archivo PDF *
                                    </label>
                                    <div className="mt-1 flex justified-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative">
                                        <div className="space-y-1 text-center w-full">
                                            <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                            <div className="text-sm text-slate-600">
                                                <label htmlFor="file" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Subir un archivo</span>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf"
                                                        className="sr-only"
                                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                        required
                                                    />
                                                </label>
                                                <p className="pl-1 inline">o arrastrar y soltar</p>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                PDF hasta 10MB
                                            </p>
                                            {file && (
                                                <p className="text-sm font-medium text-blue-600 mt-2">
                                                    Seleccionado: {file.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Content List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">
                                Documentos Publicados
                            </h3>
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {reglamentos.length} archivos
                            </span>
                        </div>

                        {reglamentos.length === 0 ? (
                            <div className="p-8">
                                <EmptyState
                                    title="No hay reglamentos cargados"
                                    description="Sube el primer reglamento utilizando el botón 'Nuevo Reglamento'."
                                    icon={<FileText size={48} className="text-slate-300" />}
                                />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Fecha</th>
                                            <th className="px-6 py-3 font-medium">Título</th>
                                            <th className="px-6 py-3 font-medium">Archivo</th>
                                            <th className="px-6 py-3 font-medium text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reglamentos.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                    {new Date(reg.created_at).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {reg.titulo}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={reg.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        <FileText size={16} />
                                                        Ver PDF
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(reg.id, reg.url)}
                                                        className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
