'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    Plus,
    Trash2,
    FileText,
    ArrowLeft,
    Upload,
    Save,
    Loader2
} from 'lucide-react';

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const { showToast } = useToast();

    useEffect(() => {
        loadReglamentos();
    }, []);

    async function loadReglamentos() {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('reglamentos')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setReglamentos(data);
        setLoading(false);
    }

    function handleFileChange(selectedFile: File | null) {
        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
            showToast('Solo se permiten archivos PDF', 'error');
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            showToast('El archivo supera el tamaño máximo de 10MB', 'error');
            return;
        }

        setFile(selectedFile);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file || !titulo.trim()) return;

        setUploading(true);
        const supabase = createClient();

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('reglamentos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('reglamentos')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('reglamentos')
                .insert({
                    titulo: titulo.trim(),
                    url: publicUrl
                });

            if (dbError) throw dbError;

            showToast('Reglamento subido correctamente', 'success');
            closeModal();
            loadReglamentos();
        } catch (error) {
            console.error('Error uploading:', error);
            showToast('Error al subir el reglamento. Verifica permisos.', 'error');
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete(reg: Reglamento) {
        if (!confirm(`¿Eliminar el reglamento "${reg.titulo}"?`)) return;

        const supabase = createClient();
        const fileName = reg.url.split('/').pop();

        if (fileName) {
            await supabase.storage.from('reglamentos').remove([fileName]);
        }

        const { error } = await supabase.from('reglamentos').delete().eq('id', reg.id);
        if (error) {
            showToast('Error al eliminar el reglamento', 'error');
        } else {
            showToast('Reglamento eliminado', 'success');
            loadReglamentos();
        }
    }

    const openModal = () => {
        setTitulo('');
        setFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTitulo('');
        setFile(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Reglamentos</h1>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium mt-2 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Volver al panel
                            </Link>
                        </div>
                        <EliteButton
                            onClick={openModal}
                            icon={<Plus size={18} />}
                        >
                            Nuevo Reglamento
                        </EliteButton>
                    </div>

                    {/* Content */}
                    <EliteCard title={`Documentos Publicados (${reglamentos.length})`}>
                        <EliteTable
                            data={reglamentos}
                            gridCols="120px 2fr 120px 100px"
                            constrainMinWidth
                            keyExtractor={(reg) => reg.id}
                            header={
                                <>
                                    <EliteHeader>Fecha</EliteHeader>
                                    <EliteHeader>Título</EliteHeader>
                                    <EliteHeader align="center">Archivo</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(reg) => (
                                <>
                                    <EliteCell>
                                        <span className="text-sm text-slate-500 font-medium">
                                            {new Date(reg.created_at).toLocaleDateString('es-ES')}
                                        </span>
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="font-bold text-slate-800 text-sm">{reg.titulo}</span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        <a
                                            href={reg.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold uppercase tracking-wide"
                                        >
                                            <FileText size={14} />
                                            Ver PDF
                                        </a>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleDelete(reg)}
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
                title="Nuevo Reglamento"
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <FileText size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Detalles del Documento
                            </h3>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Título del Reglamento *
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ej: Reglamento Técnico IPSC 2024"
                                required
                                maxLength={200}
                                className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Archivo PDF *
                            </label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 group cursor-pointer shadow-sm">
                                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 border border-slate-100">
                                    <Upload size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <p className="text-sm text-slate-600 mb-1 font-medium">
                                    <span className="text-blue-600 hover:underline">Clic para subir</span> o arrastra aquí
                                </p>
                                <p className="text-xs text-slate-400 font-medium">PDF hasta 10MB</p>

                                {file && (
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-sm font-bold shadow-sm animate-in fade-in zoom-in duration-200">
                                        <FileText size={14} />
                                        {file.name}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                    required={!file}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton
                            type="submit"
                            isLoading={uploading}
                            icon={<Save size={16} />}
                            disabled={!file || !titulo.trim()}
                        >
                            Guardar
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
