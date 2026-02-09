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
    Palette,
    Phone,
    User,
    LayoutGrid
} from 'lucide-react';

interface Modalidad {
    id: string;
    nombre: string;
    color: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
}

export default function ModalidadesPage() {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [nombre, setNombre] = useState('');
    const [color, setColor] = useState('#3B82F6');
    const [contactoNombre, setContactoNombre] = useState('');
    const [contactoTelefono, setContactoTelefono] = useState('');

    const router = useRouter();

    useEffect(() => {
        loadModalidades();
    }, []);

    async function loadModalidades() {
        const supabase = createClient();
        const { data } = await supabase
            .from('modalidades')
            .select('*')
            .order('nombre');

        if (data) {
            setModalidades(data);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const modalidadData = {
            nombre,
            color,
            contacto_nombre: contactoNombre || null,
            contacto_telefono: contactoTelefono || null
        };

        try {
            if (editingId) {
                await supabase.from('modalidades').update(modalidadData).eq('id', editingId);
            } else {
                await supabase.from('modalidades').insert(modalidadData);
            }

            resetForm();
            await loadModalidades();
        } catch (error) {
            console.error('Error saving modalidad:', error);
            alert('Error al guardar la modalidad');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setNombre('');
        setColor('#3B82F6');
        setContactoNombre('');
        setContactoTelefono('');
        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(modalidad: Modalidad) {
        setEditingId(modalidad.id);
        setNombre(modalidad.nombre);
        setColor(modalidad.color);
        setContactoNombre(modalidad.contacto_nombre || '');
        setContactoTelefono(modalidad.contacto_telefono || '');
        setShowForm(true);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar esta modalidad? Se eliminarán también los eventos asociados.')) return;

        const supabase = createClient();
        const { error } = await supabase.from('modalidades').delete().eq('id', id);

        if (error) {
            console.error('Error deleting modalidad:', error);
            alert('Error al eliminar. Asegúrate de que no tenga inscripciones asociadas.');
        } else {
            await loadModalidades();
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
                            <h1 className="text-2xl font-bold text-slate-900">Modalidades</h1>
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
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Nueva Modalidad
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-slate-900">
                                    {editingId ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre de la modalidad</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Tiro Práctico (IPSC)"
                                            required
                                            className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="color" className="block text-sm font-medium text-slate-700 mb-1">Color distintivo</label>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="contactoNombre" className="block text-sm font-medium text-slate-700 mb-1">Nombre de contacto (opcional)</label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User size={16} className="text-slate-400" />
                                                </div>
                                                <input
                                                    id="contactoNombre"
                                                    type="text"
                                                    value={contactoNombre}
                                                    onChange={(e) => setContactoNombre(e.target.value)}
                                                    className="block w-full pl-10 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    placeholder="Persona a cargo"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="contactoTelefono" className="block text-sm font-medium text-slate-700 mb-1">Teléfono de contacto (opcional)</label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone size={16} className="text-slate-400" />
                                                </div>
                                                <input
                                                    id="contactoTelefono"
                                                    type="tel"
                                                    value={contactoTelefono}
                                                    onChange={(e) => setContactoTelefono(e.target.value)}
                                                    className="block w-full pl-10 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    placeholder="09xx xxx xxx"
                                                />
                                            </div>
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
                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
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
                            <h3 className="text-lg font-medium text-slate-900">Listado de Modalidades</h3>
                        </div>

                        {modalidades.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <LayoutGrid size={32} className="text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 mb-1">No hay modalidades</p>
                                <p>Crea la primera modalidad para comenzar a organizar eventos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200">
                                {modalidades.map((modalidad) => (
                                    <div key={modalidad.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
                                                style={{ backgroundColor: modalidad.color }}
                                            >
                                                <span className="text-white font-bold text-xl uppercase">
                                                    {modalidad.nombre.substring(0, 1)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-slate-900">{modalidad.nombre}</h4>
                                                {(modalidad.contacto_nombre || modalidad.contacto_telefono) && (
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                        {modalidad.contacto_nombre && (
                                                            <span className="flex items-center gap-1">
                                                                <User size={14} />
                                                                {modalidad.contacto_nombre}
                                                            </span>
                                                        )}
                                                        {modalidad.contacto_telefono && (
                                                            <span className="flex items-center gap-1">
                                                                <Phone size={14} />
                                                                {modalidad.contacto_telefono}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:self-center self-end">
                                            <button
                                                onClick={() => handleEdit(modalidad)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(modalidad.id)}
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
