'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Club } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    Plus, Edit2, Trash2, Save, Loader2, Building2, Phone, User
} from 'lucide-react';

const PRESET_COLORS = [
    '#D91E18', '#1E3A8A', '#059669', '#DC2626', '#2563EB',
    '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#4F46E5',
    '#65A30D', '#CA8A04', '#6B7280', '#0D9488', '#BE185D',
];

export default function AdminClubesPage() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        siglas: '',
        estado: 'pendiente' as Club['estado'],
        color: '#1E3A8A',
        contacto_nombre: '',
        contacto_telefono: '',
    });

    const { showToast } = useToast();

    useEffect(() => { loadClubes(); }, []);

    async function loadClubes() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('clubes')
            .select('*')
            .order('nombre');
        if (data) setClubes(data);
        if (error) console.error('Error loading clubs:', error);
        setLoading(false);
    }

    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();
        const payload = {
            nombre: sanitize(formData.nombre),
            siglas: sanitize(formData.siglas).toUpperCase(),
            estado: formData.estado,
            color: formData.color,
            contacto_nombre: sanitize(formData.contacto_nombre) || null,
            contacto_telefono: sanitize(formData.contacto_telefono) || null,
        };
        try {
            if (editingId) {
                const { error } = await supabase.from('clubes').update(payload).eq('id', editingId);
                if (error) throw error;
                showToast('Club actualizado correctamente', 'success');
            } else {
                const { error } = await supabase.from('clubes').insert(payload);
                if (error) throw error;
                showToast('Club creado correctamente', 'success');
            }
            closeModal();
            await loadClubes();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error saving club:', error);
            showToast('Error al guardar el club', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(club: Club) {
        if (!confirm(`¿Estás seguro de eliminar el club ${club.nombre}? Esta acción no se puede deshacer.`)) return;
        const supabase = createClient();
        const { error } = await supabase.from('clubes').delete().eq('id', club.id);
        if (error) {
            console.error('Error deleting club:', error);
            showToast('Error al eliminar el club', 'error');
        } else {
            showToast('Club eliminado correctamente', 'success');
            await loadClubes();
        }
    }

    const openModal = (club?: Club) => {
        if (club) {
            setEditingId(club.id);
            setFormData({
                nombre: club.nombre,
                siglas: club.siglas,
                estado: club.estado,
                color: club.color,
                contacto_nombre: club.contacto_nombre || '',
                contacto_telefono: club.contacto_telefono || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                siglas: '',
                estado: 'pendiente',
                color: '#1E3A8A',
                contacto_nombre: '',
                contacto_telefono: '',
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
            <div className="min-h-screen bg-bg-elite flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cop-blue"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-elite flex flex-col font-sans text-text-elite">
            <Header />
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-main mx-auto space-y-6">

                    <Breadcrumbs />

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-text-elite">
                            Gestión de Clubes
                        </h1>
                        <button
                            className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95"
                            onClick={() => openModal()}
                        >
                            <Plus size={20} />
                            Nuevo Club
                        </button>
                    </div>

                    {/* Content Card */}
                    <EliteCard title="Listado Oficial de Clubes">
                        <EliteTable
                            data={clubes}
                            gridCols="48px 2fr 80px 120px 1fr 90px"
                            keyExtractor={(club) => club.id}
                            header={
                                <>
                                    <EliteHeader align="center">Color</EliteHeader>
                                    <EliteHeader>Nombre</EliteHeader>
                                    <EliteHeader align="center">Siglas</EliteHeader>
                                    <EliteHeader align="center">Estado</EliteHeader>
                                    <EliteHeader>Contacto</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(club) => (
                                <>
                                    <EliteCell align="center">
                                        <div
                                            className="w-6 h-6 rounded-full border border-black/10 shadow-sm mx-auto"
                                            style={{ backgroundColor: club.color }}
                                        />
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="font-semibold text-text-elite text-sm">{club.nombre}</span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        <span className="inline-block px-2 py-0.5 bg-cop-blue/5 rounded text-xs font-mono font-semibold text-cop-blue">
                                            {club.siglas}
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        {club.estado === 'afiliado' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Afiliado
                                            </span>
                                        ) : club.estado === 'inactivo' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                Inactivo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </EliteCell>
                                    <EliteCell>
                                        {club.contacto_nombre ? (
                                            <div className="text-xs text-text-secondary leading-relaxed">
                                                <div className="font-medium text-text-elite">{club.contacto_nombre}</div>
                                                {club.contacto_telefono && (
                                                    <div className="text-text-muted">{club.contacto_telefono}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-text-muted italic">Sin contacto</span>
                                        )}
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => openModal(club)}
                                                className="p-1.5 text-text-muted hover:text-cop-blue hover:bg-cop-blue/5 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(club)}
                                                className="p-1.5 text-text-muted hover:text-fpt-red hover:bg-fpt-red/5 rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </EliteCell>
                                </>
                            )}
                        />
                    </EliteCard>
                </div>
            </main>

            {/* Create/Edit Modal */}
            <EliteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Editar Club" : "Registrar Nuevo Club"}
                width="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Section: Identidad */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-cop-blue uppercase tracking-wider mb-3">
                            <Building2 size={14} />
                            Identidad del Club
                        </h4>

                        {/* Nombre Oficial */}
                        <div>
                            <label htmlFor="club-nombre" className="admin-label mb-1.5 block">
                                Nombre Oficial <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="club-nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="admin-input w-full"
                                placeholder="Ej. Club de Tiro Práctico..."
                                required
                            />
                        </div>

                        {/* Siglas + Estado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="club-siglas" className="admin-label mb-1.5 block">
                                    Siglas <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="club-siglas"
                                    type="text"
                                    value={formData.siglas}
                                    onChange={(e) => setFormData({ ...formData, siglas: e.target.value.toUpperCase() })}
                                    className="admin-input w-full uppercase font-mono"
                                    placeholder="Ej. CPTP"
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label htmlFor="club-estado" className="admin-label mb-1.5 block">
                                    Estado
                                </label>
                                <select
                                    id="club-estado"
                                    value={formData.estado}
                                    onChange={(e) => {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        setFormData({ ...formData, estado: e.target.value as any });
                                    }}
                                    className="admin-input w-full"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="afiliado">Afiliado</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Contacto + Color */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-cop-blue uppercase tracking-wider mb-3">
                            <User size={14} />
                            Contacto y Branding
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="club-contacto-nombre" className="admin-label mb-1.5 block">
                                    Referente
                                </label>
                                <input
                                    id="club-contacto-nombre"
                                    type="text"
                                    value={formData.contacto_nombre}
                                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                                    className="admin-input w-full"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label htmlFor="club-contacto-telefono" className="admin-label mb-1.5 block">
                                    Teléfono
                                </label>
                                <input
                                    id="club-contacto-telefono"
                                    type="tel"
                                    value={formData.contacto_telefono}
                                    onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                                    className="admin-input w-full"
                                    placeholder="Ej. 0981 123 456"
                                />
                            </div>
                        </div>

                        {/* Color Distintivo (Compact) */}
                        <div className="pt-2 border-t border-slate-200 mt-2">
                            <label className="admin-label mb-2 block">Color Distintivo</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`
                                            w-6 h-6 rounded-full border-2 transition-all hover:scale-110 shadow-sm
                                            ${formData.color === c ? 'border-slate-800 scale-110 ring-1 ring-slate-300' : 'border-transparent'}
                                        `}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                                {/* Custom Color Input Wrapper */}
                                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-300 ml-1">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full h-full" style={{ backgroundColor: formData.color }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary shadow-btn-red hover:shadow-btn-red-hover active:scale-95"
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            <span className="ml-2">{editingId ? 'Actualizar' : 'Guardar'}</span>
                        </button>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
