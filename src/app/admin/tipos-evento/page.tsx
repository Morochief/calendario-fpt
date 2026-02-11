'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { TipoEvento } from '@/lib/types';
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
            nombre,
            color
        };

        try {
            if (editingId) {
                await supabase.from('tipos_evento').update(tipoData).eq('id', editingId);
            } else {
                await supabase.from('tipos_evento').insert(tipoData);
            }

            resetForm();
            await loadTipos();
        } catch (error) {
            console.error('Error saving tipo:', error);
            alert('Error al guardar el tipo de evento');
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
            alert('Error al eliminar. Puede que esté en uso en algún evento.');
        } else {
            await loadTipos();
        }
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
                <div className="max-w-4xl mx-auto space-y-6">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1E3A8A]">Tipos de Evento</h1>
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
                                Nuevo Tipo
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-[#1E3A8A]">
                                    {editingId ? 'Editar Tipo' : 'Nuevo Tipo de Evento'}
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre del tipo</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Competencia, Entrenamiento, Curso"
                                            required
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">Color de etiqueta</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="h-10 w-20 rounded border border-slate-300 p-1 cursor-pointer"
                                            />
                                            <span className="text-sm text-slate-500 font-mono">{color}</span>
                                        </div>
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

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-medium text-[#1E3A8A]">Listado de Tipos</h3>
                        </div>

                        {tipos.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <List size={32} className="text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 mb-1">No hay tipos de evento</p>
                                <p>Crea tipos para categorizar tus eventos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {tipos.map((tipo) => (
                                    <div key={tipo.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                                style={{ backgroundColor: tipo.color || '#64748B' }}
                                            >
                                                <Tag size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-slate-900">{tipo.nombre}</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(tipo)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tipo.id)}
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
