'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { isAllowedAdmin } from '@/lib/utils';
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
    Save,
    Tag
} from 'lucide-react';

interface Modalidad {
    id: string;
    nombre: string;
    color: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
}

import { useRouter } from 'next/navigation';

export default function ModalidadesPage() {
    const [modalidades, setModalidades] = useState<Modalidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        color: '#3B82F6',
        contactoNombre: '',
        contactoTelefono: ''
    });

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

        loadModalidades();
    }

    useEffect(() => {
        checkAuth();
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
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Sección: Información Principal */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <Tag size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Detalles de la Modalidad
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Nombre de la Modalidad
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Tiro Práctico (IPSC)"
                                    required
                                    maxLength={100}
                                    className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Color
                                </label>
                                <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg h-[46px]">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="h-8 w-10 rounded cursor-pointer border-0 p-0 bg-transparent"
                                        title="Seleccionar color distintivo"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-600">
                                <User size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Referente / Contacto
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Nombre del Responsable
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.contactoNombre}
                                        onChange={(e) => setFormData({ ...formData, contactoNombre: e.target.value })}
                                        placeholder="Nombre completo"
                                        maxLength={100}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.contactoTelefono}
                                        onChange={(e) => setFormData({ ...formData, contactoTelefono: e.target.value })}
                                        placeholder="Ej: 0981..."
                                        maxLength={20}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700"
                                    />
                                </div>
                            </div>
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
