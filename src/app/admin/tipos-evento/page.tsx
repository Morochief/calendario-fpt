'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { TipoEvento } from '@/lib/types';
import { useToast } from '@/components/Toast';
import {
    Plus,
    ArrowLeft,
    Edit2,
    Trash2,
    X,
    Save,
    Tag,
    List
} from 'lucide-react';

export default function TiposEventoPage() {
    const [tipos, setTipos] = useState<TipoEvento[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [color, setColor] = useState('#64748B');

    const router = useRouter();
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

        if (data) {
            setTipos(data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const tipoData = {
            nombre: nombre.trim(),
            color
        };

        try {
            if (editingId) {
                await supabase.from('tipos_evento').update(tipoData).eq('id', editingId);
                showToast('Tipo de evento actualizado correctamente', 'success');
            } else {
                await supabase.from('tipos_evento').insert(tipoData);
                showToast('Tipo de evento creado correctamente', 'success');
            }

            resetForm();
            await loadTipos();
        } catch (error) {
            console.error('Error saving tipo:', error);
            showToast('Error al guardar el tipo de evento', 'error');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setNombre('');
        setColor('#64748B');
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(tipo: TipoEvento) {
        setEditingId(tipo.id);
        setNombre(tipo.nombre);
        setColor(tipo.color || '#64748B');
        setShowForm(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este tipo de evento?')) return;

        const supabase = createClient();
        const { error } = await supabase.from('tipos_evento').delete().eq('id', id);

        if (error) {
            console.error('Error deleting tipo:', error);
            showToast('Error al eliminar. Puede que esté en uso en algún evento.', 'error');
        } else {
            showToast('Tipo de evento eliminado', 'success');
            await loadTipos();
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-elite flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cop-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 animate-page-enter">
                <div className="max-w-4xl mx-auto space-y-6">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-elite">Tipos de Evento</h1>
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
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-elite-sm shadow-elite-xs text-sm font-medium text-white bg-fpt-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fpt-red transition-all active:scale-[0.97]"
                            >
                                <Plus size={16} className="mr-2" />
                                Nuevo Tipo
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-surface rounded-elite-md shadow-elite-sm border border-border-elite overflow-hidden">
                            <div className="border-b border-border-elite px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-text-elite">
                                    {editingId ? 'Editar Tipo' : 'Nuevo Tipo de Evento'}
                                </h3>
                                <button onClick={resetForm} className="text-text-muted hover:text-text-secondary transition-colors" aria-label="Cerrar formulario">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre del tipo</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Competencia, Entrenamiento, Curso"
                                            required
                                            maxLength={100}
                                            className="block w-full rounded-elite-sm border border-border-elite shadow-elite-xs focus:border-cop-blue focus:ring-1 focus:ring-cop-blue sm:text-sm transition-colors hover:border-border-hover px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="color" className="block text-sm font-medium text-text-secondary mb-1">Color de etiqueta</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 w-20 rounded-elite-sm border border-border-elite p-1 cursor-pointer"
                                            />
                                            <span className="text-sm text-text-muted font-mono">{color}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-border-elite">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="inline-flex items-center px-4 py-2 border border-border-elite rounded-elite-sm shadow-elite-xs text-sm font-medium text-text-secondary bg-surface hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cop-blue transition-all active:scale-[0.97]"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-elite-sm shadow-elite-xs text-sm font-medium text-white bg-fpt-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fpt-red transition-all disabled:opacity-50 active:scale-[0.97]"
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

                    <div className="bg-surface rounded-elite-md shadow-elite-sm border border-border-elite overflow-hidden">
                        <div className="px-6 py-4 border-b border-border-elite">
                            <h3 className="text-lg font-medium text-text-elite">Listado de Tipos</h3>
                        </div>

                        {tipos.length === 0 ? (
                            <div className="p-12 text-center text-text-secondary">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                                    <List size={32} className="text-text-muted" />
                                </div>
                                <p className="text-lg font-medium text-text-elite mb-1">No hay tipos de evento</p>
                                <p>Crea tipos para categorizar tus eventos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-elite">
                                {tipos.map((tipo) => (
                                    <div key={tipo.id} className="p-4 sm:p-6 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-elite-sm flex items-center justify-center shadow-elite-xs"
                                                style={{ backgroundColor: tipo.color || '#64748B' }}
                                            >
                                                <Tag size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-text-elite">{tipo.nombre}</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(tipo)}
                                                className="p-2 text-text-muted hover:text-cop-blue hover:bg-blue-50 rounded-elite-sm transition-all active:scale-95"
                                                title="Editar"
                                                aria-label={`Editar tipo ${tipo.nombre}`}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tipo.id)}
                                                className="p-2 text-text-muted hover:text-fpt-red hover:bg-red-50 rounded-elite-sm transition-all active:scale-95"
                                                title="Eliminar"
                                                aria-label={`Eliminar tipo ${tipo.nombre}`}
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
