'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Club } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    ArrowLeft, Plus, Edit2, Trash2, Building2, Save, X
} from 'lucide-react';

export default function AdminClubesPage() {
    const [clubes, setClubes] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nombre: '',
        siglas: '',
        estado: 'pendiente' as Club['estado'],
        color: '#1E3A8A'
    });

    const { showToast } = useToast();

    useEffect(() => {
        loadClubes();
    }, []);

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

    // Sanitization Helper
    const sanitize = (text: string) => text.replace(/[<>]/g, '').trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const supabase = createClient();
        const payload = {
            nombre: sanitize(formData.nombre),
            siglas: sanitize(formData.siglas).toUpperCase(),
            estado: formData.estado,
            color: formData.color
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
        } catch (error) {
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
                color: club.color
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                siglas: '',
                estado: 'pendiente',
                color: '#1E3A8A'
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
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Gestión de Clubes
                            </h1>
                            <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 font-medium mt-2 transition-colors">
                                <ArrowLeft size={16} /> Volver al panel
                            </Link>
                        </div>
                        <EliteButton
                            onClick={() => openModal()}
                            icon={<Plus size={18} />}
                        >
                            Nuevo Club
                        </EliteButton>
                    </div>

                    {/* Content Card */}
                    <EliteCard title="Listado Oficial de Clubes">
                        <EliteTable
                            data={clubes}
                            gridCols="60px 2fr 100px 140px 100px"
                            keyExtractor={(club) => club.id}
                            header={
                                <>
                                    <EliteHeader align="center">Color</EliteHeader>
                                    <EliteHeader>Nombre / Siglas</EliteHeader>
                                    <EliteHeader align="center">Siglas</EliteHeader>
                                    <EliteHeader align="center">Estado</EliteHeader>
                                    <EliteHeader align="right">Acciones</EliteHeader>
                                </>
                            }
                            renderRow={(club) => (
                                <>
                                    <EliteCell align="center">
                                        <div
                                            className="w-8 h-8 rounded-full border border-black/10 shadow-sm mx-auto"
                                            style={{ backgroundColor: club.color }}
                                        />
                                    </EliteCell>
                                    <EliteCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{club.nombre}</span>
                                        </div>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-mono font-semibold text-slate-600">
                                            {club.siglas}
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        {club.estado === 'afiliado' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Afiliado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(club)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(club)}
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

            {/* Create/Edit Modal */}
            <EliteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Editar Club" : "Registrar Nuevo Club"}
            >
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre Oficial</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800"
                            placeholder="Ej. Club de Tiro Práctico..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Siglas */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Siglas</label>
                            <input
                                type="text"
                                value={formData.siglas}
                                onChange={(e) => setFormData({ ...formData, siglas: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono text-sm"
                                placeholder="Ej. CPTP"
                                required
                                maxLength={8}
                            />
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="afiliado">Afiliado</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Color Distintivo</label>
                        <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="h-10 w-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-mono text-slate-500">{formData.color}</div>
                                <div className="text-xs text-slate-400">Usado en bordes y gráficas</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton type="submit" isLoading={saving} icon={<Save size={16} />}>
                            Guardar Club
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
