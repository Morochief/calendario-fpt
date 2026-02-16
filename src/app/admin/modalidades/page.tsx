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
    ArrowLeft,
    Edit2,
    Trash2,
    Phone,
    User,
    Save
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        color: '#3B82F6',
        contactoNombre: '',
        contactoTelefono: ''
    });

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

        if (data) setModalidades(data);
        setLoading(false);
    }

    // Security: Input Sanitization
    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        const modalidadData = {
            nombre: sanitize(formData.nombre),
            color: formData.color,
            contacto_nombre: sanitize(formData.contactoNombre) || null,
            contacto_telefono: sanitize(formData.contactoTelefono) || null
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('modalidades').update(modalidadData).eq('id', editingId);
                if (error) throw error;
                showToast('Modalidad actualizada correctamente', 'success');
            } else {
                const { error } = await supabase.from('modalidades').insert(modalidadData);
                if (error) throw error;
                showToast('Modalidad creada correctamente', 'success');
            }

            closeModal();
            await loadModalidades();
        } catch (error) {
            console.error('Error saving modalidad:', error);
            showToast('Error al guardar la modalidad', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(modalidad: Modalidad) {
        if (!confirm(`¿Estás seguro de eliminar "${modalidad.nombre}"? Se eliminarán los eventos asociados.`)) return;

        const supabase = createClient();
        const { error } = await supabase.from('modalidades').delete().eq('id', modalidad.id);

        if (error) {
            console.error('Error deleting modalidad:', error);
            showToast('Error al eliminar. Asegúrate de que no tenga inscripciones asociadas.', 'error');
        } else {
            showToast('Modalidad eliminada', 'success');
            await loadModalidades();
        }
    }

    const openModal = (modalidad?: Modalidad) => {
        if (modalidad) {
            setEditingId(modalidad.id);
            setFormData({
                nombre: modalidad.nombre,
                color: modalidad.color,
                contactoNombre: modalidad.contacto_nombre || '',
                contactoTelefono: modalidad.contacto_telefono || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                color: '#3B82F6',
                contactoNombre: '',
                contactoTelefono: ''
            });
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
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modalidades</h1>
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
                            Nueva Modalidad
                        </EliteButton>
                    </div>

                    {/* Content */}
                    <EliteCard title="Listado de Modalidades">
                        <EliteTable
                            data={modalidades}
                            gridCols="60px 1fr 100px"
                            keyExtractor={(m) => m.id}
                            header={
                                <>
                                    <EliteHeader align="center">Inicial</EliteHeader>
                                    <EliteHeader>Modalidad / Contacto</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(modalidad) => (
                                <>
                                    <EliteCell align="center">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm mx-auto text-white font-bold text-lg uppercase"
                                            style={{ backgroundColor: modalidad.color }}
                                        >
                                            {modalidad.nombre.substring(0, 1)}
                                        </div>
                                    </EliteCell>
                                    <EliteCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-base">{modalidad.nombre}</span>
                                            {(modalidad.contacto_nombre || modalidad.contacto_telefono) && (
                                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    {modalidad.contacto_nombre && (
                                                        <span className="flex items-center gap-1">
                                                            <User size={12} />
                                                            {modalidad.contacto_nombre}
                                                        </span>
                                                    )}
                                                    {modalidad.contacto_telefono && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} />
                                                            {modalidad.contacto_telefono}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(modalidad)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(modalidad)}
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
                title={editingId ? 'Editar Modalidad' : 'Nueva Modalidad'}
                width="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de la Modalidad</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Tiro Práctico (IPSC)"
                            required
                            maxLength={100}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Color Distintivo</label>
                        <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="h-10 w-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <div className="flex-1">
                                <span className="text-sm font-mono text-slate-600">{formData.color}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Contacto (Nombre)</label>
                            <input
                                type="text"
                                value={formData.contactoNombre}
                                onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                                placeholder="Persona responsable"
                                maxLength={100}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Contacto (Teléfono)</label>
                            <input
                                type="tel"
                                value={formData.contactoTelefono}
                                onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                                placeholder="09xx..."
                                maxLength={20}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
