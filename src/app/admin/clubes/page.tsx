'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    Plus, Edit2, Trash2, Save, Building2, Phone, User
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
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Nombre Oficial */}
                    <div>
                        <label htmlFor="club-nombre" className="admin-label">
                            Nombre Oficial <span className="required">*</span>
                        </label>
                        <input
                            id="club-nombre"
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="admin-input"
                            placeholder="Ej. Club de Tiro Práctico..."
                            required
                        />
                    </div>

                    {/* Siglas + Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label htmlFor="club-siglas" className="admin-label">
                                Siglas <span className="required">*</span>
                            </label>
                            <input
                                id="club-siglas"
                                type="text"
                                value={formData.siglas}
                                onChange={(e) => setFormData({ ...formData, siglas: e.target.value.toUpperCase() })}
                                className="admin-input"
                                placeholder="Ej. CPTP"
                                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                                required
                                maxLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="club-estado" className="admin-label">
                                Estado
                            </label>
                            <select
                                id="club-estado"
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                                className="admin-input"
                            >
                                <option value="pendiente">Pendiente</option>
                                <option value="afiliado">Afiliado</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label htmlFor="club-contacto-nombre" className="admin-label">
                                <User size={13} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                                Referente
                            </label>
                            <input
                                id="club-contacto-nombre"
                                type="text"
                                value={formData.contacto_nombre}
                                onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                                className="admin-input"
                                placeholder="Ej. Juan Pérez"
                            />
                        </div>
                        <div>
                            <label htmlFor="club-contacto-telefono" className="admin-label">
                                <Phone size={13} className="inline mr-1" style={{ verticalAlign: '-1px' }} />
                                Teléfono
                            </label>
                            <input
                                id="club-contacto-telefono"
                                type="tel"
                                value={formData.contacto_telefono}
                                onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                                className="admin-input"
                                placeholder="Ej. 0981 123 456"
                            />
                        </div>
                    </div>

                    {/* Color Distintivo */}
                    <div>
                        <label className="admin-label mb-2 block">Color Distintivo</label>
                        <div className="color-picker-container">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '6px',
                                        backgroundColor: c,
                                        border: formData.color === c
                                            ? '2.5px solid #1E3A8A'
                                            : '1.5px solid rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        transform: formData.color === c ? 'scale(1.15)' : 'scale(1)',
                                        boxShadow: formData.color === c
                                            ? '0 0 0 3px rgba(30,58,138,0.15)'
                                            : 'none',
                                    }}
                                    title={c}
                                />
                            ))}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginLeft: 'auto', paddingLeft: '0.5rem',
                            }}>
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '6px', cursor: 'pointer',
                                        border: '1.5px solid rgba(0,0,0,0.1)',
                                        padding: 0, background: 'transparent',
                                    }}
                                    title="Color personalizado"
                                />
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    color: '#94A3B8',
                                    minWidth: '55px',
                                }}>{formData.color}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        gap: '0.75rem', paddingTop: '0.5rem',
                    }}>
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton type="submit" isLoading={saving} icon={<Save size={16} />}>
                            {editingId ? 'Actualizar Club' : 'Guardar Club'}
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
