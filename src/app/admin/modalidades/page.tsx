'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
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
    const { showToast } = useToast();

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
            nombre: nombre.trim(),
            color,
            contacto_nombre: contactoNombre.trim() || null,
            contacto_telefono: contactoTelefono.trim() || null
        };

        try {
            if (editingId) {
                await supabase.from('modalidades').update(modalidadData).eq('id', editingId);
                showToast('Modalidad actualizada correctamente', 'success');
            } else {
                await supabase.from('modalidades').insert(modalidadData);
                showToast('Modalidad creada correctamente', 'success');
            }

            resetForm();
            await loadModalidades();
        } catch (error) {
            console.error('Error saving modalidad:', error);
            showToast('Error al guardar la modalidad', 'error');
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
            showToast('Error al eliminar. Asegúrate de que no tenga inscripciones asociadas.', 'error');
        } else {
            showToast('Modalidad eliminada', 'success');
            await loadModalidades();
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
                            <h1 className="text-2xl font-bold text-text-elite">Modalidades</h1>
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
                                Nueva Modalidad
                            </button>
                        )}
                    </div>

                    {showForm && (
                        <div className="bg-surface rounded-elite-md shadow-elite-sm border border-border-elite overflow-hidden">
                            <div className="border-b border-border-elite px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-text-elite">
                                    {editingId ? 'Editar Modalidad' : 'Nueva Modalidad'}
                                </h3>
                                <button onClick={resetForm} className="text-text-muted hover:text-text-secondary transition-colors" aria-label="Cerrar formulario">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="nombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre de la modalidad</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej: Tiro Práctico (IPSC)"
                                            required
                                            maxLength={100}
                                            className="block w-full rounded-elite-sm border border-border-elite shadow-elite-xs focus:border-cop-blue focus:ring-1 focus:ring-cop-blue sm:text-sm transition-colors hover:border-border-hover px-3 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="color" className="block text-sm font-medium text-text-secondary mb-1">Color distintivo</label>
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="contactoNombre" className="block text-sm font-medium text-text-secondary mb-1">Nombre de contacto (opcional)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User size={16} className="text-text-muted" />
                                                </div>
                                                <input
                                                    id="contactoNombre"
                                                    type="text"
                                                    value={contactoNombre}
                                                    onChange={(e) => setContactoNombre(e.target.value)}
                                                    maxLength={100}
                                                    className="block w-full pl-10 rounded-elite-sm border border-border-elite focus:border-cop-blue focus:ring-1 focus:ring-cop-blue sm:text-sm transition-colors hover:border-border-hover px-3 py-2"
                                                    placeholder="Persona a cargo"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="contactoTelefono" className="block text-sm font-medium text-text-secondary mb-1">Teléfono de contacto (opcional)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone size={16} className="text-text-muted" />
                                                </div>
                                                <input
                                                    id="contactoTelefono"
                                                    type="tel"
                                                    value={contactoTelefono}
                                                    onChange={(e) => setContactoTelefono(e.target.value)}
                                                    maxLength={20}
                                                    className="block w-full pl-10 rounded-elite-sm border border-border-elite focus:border-cop-blue focus:ring-1 focus:ring-cop-blue sm:text-sm transition-colors hover:border-border-hover px-3 py-2"
                                                    placeholder="09xx xxx xxx"
                                                />
                                            </div>
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
                            <h3 className="text-lg font-medium text-text-elite">Listado de Modalidades</h3>
                        </div>

                        {modalidades.length === 0 ? (
                            <div className="p-12 text-center text-text-secondary">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                                    <LayoutGrid size={32} className="text-text-muted" />
                                </div>
                                <p className="text-lg font-medium text-text-elite mb-1">No hay modalidades</p>
                                <p>Crea la primera modalidad para comenzar a organizar eventos.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-elite">
                                {modalidades.map((modalidad) => (
                                    <div key={modalidad.id} className="p-4 sm:p-6 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="w-12 h-12 rounded-elite-sm flex items-center justify-center shadow-elite-xs flex-shrink-0"
                                                style={{ backgroundColor: modalidad.color }}
                                            >
                                                <span className="text-white font-bold text-xl uppercase">
                                                    {modalidad.nombre.substring(0, 1)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-text-elite">{modalidad.nombre}</h4>
                                                {(modalidad.contacto_nombre || modalidad.contacto_telefono) && (
                                                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
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
                                                className="p-2 text-text-muted hover:text-cop-blue hover:bg-blue-50 rounded-elite-sm transition-all active:scale-95"
                                                title="Editar"
                                                aria-label={`Editar modalidad ${modalidad.nombre}`}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(modalidad.id)}
                                                className="p-2 text-text-muted hover:text-fpt-red hover:bg-red-50 rounded-elite-sm transition-all active:scale-95"
                                                title="Eliminar"
                                                aria-label={`Eliminar modalidad ${modalidad.nombre}`}
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
