'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { TipoEvento } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    ArrowLeft, Plus, Edit2, Trash2, Tag, Save
} from 'lucide-react';

export default function TiposEventoPage() {
    const [tipos, setTipos] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [color, setColor] = useState('#64748B');

    const { showToast } = useToast();

    useEffect(() => {
        loadTipos();
    }, []);

    async function loadTipos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('tipos_evento')
            .select('*')
            .order('nombre');

        if (data) setTipos(data);
        setLoading(false);
    }

    // Security: Input Sanitization
    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const tipoData = {
            nombre: sanitize(nombre),
            color
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('tipos_evento').update(tipoData).eq('id', editingId);
                if (error) throw error;
                showToast('Tipo de evento actualizado correctamente', 'success');
            } else {
                const { error } = await supabase.from('tipos_evento').insert(tipoData);
                if (error) throw error;
                showToast('Tipo de evento creado correctamente', 'success');
            }

            closeModal();
            await loadTipos();
        } catch (error) {
            console.error('Error saving tipo:', error);
            showToast('Error al guardar el tipo de evento', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(tipo: TipoEvento) {
        if (!confirm(`¿Estás seguro de eliminar el tipo "${tipo.nombre}"?`)) return;

        const supabase = createClient();
        const { error } = await supabase.from('tipos_evento').delete().eq('id', tipo.id);

        if (error) {
            console.error('Error deleting tipo:', error);
            showToast('Error al eliminar. Puede que esté en uso en algún evento.', 'error');
        } else {
            showToast('Tipo de evento eliminado', 'success');
            await loadTipos();
        }
    }

    const openModal = (tipo?: TipoEvento) => {
        if (tipo) {
            setEditingId(tipo.id);
            setNombre(tipo.nombre);
            setColor(tipo.color || '#64748B');
        } else {
            setEditingId(null);
            setNombre('');
            setColor('#64748B');
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
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tipos de Evento</h1>
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
                            Nuevo Tipo
                        </EliteButton>
                    </div>

                    {/* Content */}
                    <EliteCard title="Catálogo de Tipos de Evento">
                        <EliteTable
                            data={tipos}
                            gridCols="60px 1fr 100px"
                            keyExtractor={(t) => t.id}
                            header={
                                <>
                                    <EliteHeader align="center">Etiqueta</EliteHeader>
                                    <EliteHeader>Nombre</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(tipo) => (
                                <>
                                    <EliteCell align="center">
                                        <div
                                            className="w-8 h-8 rounded-md shadow-sm mx-auto flex items-center justify-center text-white"
                                            style={{ backgroundColor: tipo.color || '#64748B' }}
                                        >
                                            <Tag size={14} />
                                        </div>
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="font-bold text-slate-800 text-sm">{tipo.nombre}</span>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(tipo)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tipo)}
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
                title={editingId ? 'Editar Tipo' : 'Nuevo Tipo de Evento'}
                width="max-w-lg"
                contentClassName="bg-slate-50/50"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Main Form Card */}
                    <EliteCard className="border-slate-200 shadow-sm" noPadding>
                        <div className="p-5 space-y-5">
                            {/* Header Section */}
                            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Tag size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Información del Tipo</h4>
                                    <p className="text-xs text-slate-500 font-medium">Define el nombre y color identificador</p>
                                </div>
                            </div>

                            {/* Inputs Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="nombre" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        Nombre
                                    </label>
                                    <input
                                        id="nombre"
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Competencia, Entrenamiento"
                                        required
                                        maxLength={50}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="color" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                                        Color
                                    </label>
                                    <div className="h-[42px] px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center">
                                        <input
                                            id="color"
                                            type="color"
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className="h-full w-12 rounded cursor-pointer border-0 p-0"
                                            title="Seleccionar color"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </EliteCard>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <EliteButton
                            type="submit"
                            isLoading={saving}
                            icon={<Save size={16} />}
                            className="shadow-lg shadow-blue-900/20"
                        >
                            Guardar Cambios
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div >
    );
}
