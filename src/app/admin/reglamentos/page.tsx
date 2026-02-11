'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import { createClient } from '@/lib/supabase';
import { Plus, Save, Trash2, FileText, ArrowLeft, Upload, X, BookOpen, Loader2 } from 'lucide-react';

interface Reglamento {
    id: string;
    titulo: string;
    url: string;
    created_at: string;
}

export default function AdminReglamentosPage() {
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
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    <Breadcrumbs />

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1E3A8A]">Gestión de Reglamentos</h1>
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
                                <Plus size={18} className="mr-2" />
                                Nuevo Reglamento
                            </button>
                        )}
                    </div>

                    {/* Upload Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#1E3A8A]">
                                    Nuevo Reglamento
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Archivo PDF *
                                    </label>
                                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <Upload size={40} className="mx-auto text-slate-400 mb-3" />
                                        <p className="text-sm text-slate-600 mb-1">
                                            <span className="font-medium text-blue-600">Sube un archivo</span> o arrástralo aquí
                                        </p>
                                        <p className="text-xs text-slate-400">PDF hasta 10MB</p>

                                        {file && (
                                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                                <FileText size={14} />
                                                {file.name}
                                            </div>
                                        )}

                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            required
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#D91E18] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Subiendo...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} className="mr-2" />
                                                Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Documents List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-slate-400" />
                                <h3 className="text-lg font-medium text-[#1E3A8A]">
                                    Documentos Publicados
                                </h3>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {reglamentos.length} archivos
                            </span>
                        </div>

                        {reglamentos.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <FileText size={32} className="text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 mb-1">No hay reglamentos cargados</p>
                                <p>Sube el primer reglamento utilizando el botón "Nuevo Reglamento".</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Título</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Archivo</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {reglamentos.map((reg) => (
                                            <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(reg.created_at).toLocaleDateString('es-ES')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {reg.titulo}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <a
                                                        href={reg.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                    >
                                                        <FileText size={16} />
                                                        Ver PDF
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(reg.id, reg.url)}
                                                        className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
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
