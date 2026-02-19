'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { isAllowedAdmin } from '@/lib/utils';
import { Club } from '@/lib/types';
import { useToast } from '@/components/Toast';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import EliteCard from '@/components/ui/EliteCard';
import EliteTable, { EliteHeader, EliteCell } from '@/components/ui/EliteTable';
import EliteButton from '@/components/ui/EliteButton';
import EliteModal from '@/components/ui/EliteModal';
import {
    Plus, Edit2, Trash2, Save, Building2, Phone, User, Tag, Image as ImageIcon, X
} from 'lucide-react';
import Image from 'next/image';

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
    const router = useRouter();

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

        loadClubes();
    }

    useEffect(() => { checkAuth(); }, []);

    const [formData, setFormData] = useState({
        nombre: '',
        siglas: '',
        estado: 'pendiente' as Club['estado'],
        color: '#1E3A8A',
        contacto_nombre: '',
        contacto_telefono: '',
        logo_url: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { showToast } = useToast();

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

    async function uploadLogo(file: File, clubSiglas: string): Promise<string | null> {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${clubSiglas.toLowerCase()}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('club_logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('club_logos')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading logo:', error);
            showToast('Error subiendo el logo, pero el club se guardará.', 'error');
            return null;
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();

        // 1. Upload Logo if there's a file
        let uploadedLogoUrl = formData.logo_url;
        if (logoFile) {
            const newLogoUrl = await uploadLogo(logoFile, formData.siglas);
            if (newLogoUrl) {
                uploadedLogoUrl = newLogoUrl;
            }
        }

        const payload = {
            nombre: sanitize(formData.nombre),
            siglas: sanitize(formData.siglas).toUpperCase(),
            estado: formData.estado,
            color: formData.color,
            contacto_nombre: sanitize(formData.contacto_nombre) || null,
            contacto_telefono: sanitize(formData.contacto_telefono) || null,
            logo_url: uploadedLogoUrl || null,
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
        setLogoFile(null);
        setLogoPreview(null);
        if (club) {
            setEditingId(club.id);
            setFormData({
                nombre: club.nombre,
                siglas: club.siglas,
                estado: club.estado,
                color: club.color,
                contacto_nombre: club.contacto_nombre || '',
                contacto_telefono: club.contacto_telefono || '',
                logo_url: club.logo_url || '',
            });
            if (club.logo_url) {
                setLogoPreview(club.logo_url);
            }
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                siglas: '',
                estado: 'pendiente',
                color: '#1E3A8A',
                contacto_nombre: '',
                contacto_telefono: '',
                logo_url: '',
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
                        <div>
                            <h1 className="text-2xl font-bold text-text-elite tracking-tight">
                                Gestión de Clubes
                            </h1>
                            <p className="text-sm text-text-muted mt-1">
                                Administra las entidades afiliadas y sus detalles.
                            </p>
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
                            gridCols="60px 2fr 100px 100px 1fr 100px"
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
                                        {club.logo_url ? (
                                            <div className="w-8 h-8 rounded-lg shadow-sm mx-auto overflow-hidden relative bg-white border border-slate-200">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={club.logo_url}
                                                    alt={`Logo ${club.siglas}`}
                                                    className="w-full h-full object-contain p-0.5"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="w-8 h-8 rounded-lg shadow-sm mx-auto flex items-center justify-center text-white font-bold text-xs"
                                                style={{ backgroundColor: club.color }}
                                            >
                                                {club.nombre.substring(0, 1)}
                                            </div>
                                        )}
                                    </EliteCell>
                                    <EliteCell>
                                        <span className="font-semibold text-text-elite text-sm">{club.nombre}</span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        <span className="inline-block px-2 py-1 bg-slate-100 rounded-md text-xs font-mono font-bold text-slate-600 border border-slate-200">
                                            {club.siglas}
                                        </span>
                                    </EliteCell>
                                    <EliteCell align="center">
                                        {club.estado === 'afederado' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                Afederado
                                            </span>
                                        ) : club.estado === 'no_afederado' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                                                No Afederado
                                            </span>
                                        ) : club.estado === 'inactivo' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                Inactivo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                Pendiente
                                            </span>
                                        )}
                                    </EliteCell>
                                    <EliteCell>
                                        {club.contacto_nombre ? (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-text-elite">
                                                    <User size={12} className="text-cop-blue" />
                                                    {club.contacto_nombre}
                                                </div>
                                                {club.contacto_telefono && (
                                                    <div className="flex items-center gap-1.5 text-xs text-text-muted ml-0.5">
                                                        <Phone size={10} />
                                                        {club.contacto_telefono}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-text-muted italic opacity-60">Sin contacto</span>
                                        )}
                                    </EliteCell>
                                    <EliteCell align="right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(club)}
                                                className="p-2 text-slate-400 hover:text-cop-blue hover:bg-cop-blue/5 rounded-lg transition-all"
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

            {/* Create/Edit Modal - Premium Style */}
            <EliteModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Editar Club" : "Registrar Nuevo Club"}
                width="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Section: Identidad */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-cop-blue">
                                <Building2 size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Identidad del Club
                            </h3>
                        </div>

                        {/* Nombre Oficial */}
                        <div>
                            <label htmlFor="club-nombre" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Nombre Oficial <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="club-nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-400"
                                placeholder="Ej. Club de Tiro Práctico..."
                                required
                            />
                        </div>

                        {/* Siglas + Estado */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="club-siglas" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Siglas <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="club-siglas"
                                    type="text"
                                    value={formData.siglas}
                                    onChange={(e) => setFormData({ ...formData, siglas: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono font-bold text-slate-800 uppercase placeholder:text-slate-400"
                                    placeholder="Ej. CPTP"
                                    required
                                    maxLength={8}
                                />
                            </div>
                            <div>
                                <label htmlFor="club-estado" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Estado
                                </label>
                                <div className="relative">
                                    <select
                                        id="club-estado"
                                        value={formData.estado}
                                        onChange={(e) => {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            setFormData({ ...formData, estado: e.target.value as any });
                                        }}
                                        className="w-full px-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none font-medium text-slate-700 cursor-pointer"
                                    >
                                        <option value="pendiente">Pendiente</option>
                                        <option value="afederado">Afederado</option>
                                        <option value="no_afederado">No Afederado</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                        <Tag size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Contacto + Color */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-white rounded-md shadow-sm text-cop-blue">
                                <User size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                Contacto y Branding
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="club-contacto-nombre" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Referente
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <User size={14} />
                                    </div>
                                    <input
                                        id="club-contacto-nombre"
                                        type="text"
                                        value={formData.contacto_nombre}
                                        onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="club-contacto-telefono" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Phone size={14} />
                                    </div>
                                    <input
                                        id="club-contacto-telefono"
                                        type="tel"
                                        value={formData.contacto_telefono}
                                        onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                                        placeholder="Ej. 0981..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Color Distintivo */}
                        <div className="pt-2 border-t border-slate-200/60 mt-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color Distintivo</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`
                                            w-6 h-6 rounded-md border-2 transition-all hover:scale-110 shadow-sm
                                            ${formData.color === c ? 'border-slate-800 scale-110 ring-2 ring-slate-200' : 'border-transparent'}
                                        `}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                                {/* Custom Color Input Wrapper */}
                                <div className="relative w-6 h-6 rounded-md overflow-hidden border border-slate-300 ml-1 hover:border-slate-400 transition-colors">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-0 cursor-pointer"
                                    />
                                    <div className="w-full h-full flex items-center justify-center bg-white" style={{ backgroundColor: formData.color }}>
                                        <Plus size={10} className="text-white mix-blend-difference" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="pt-2 border-t border-slate-200/60 mt-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Logo del Club (Opcional)
                            </label>

                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 relative group">
                                    {logoPreview ? (
                                        <>
                                            <Image
                                                src={logoPreview}
                                                alt="Preview"
                                                fill
                                                className="object-contain p-1"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogoFile(null);
                                                    setLogoPreview(null);
                                                    setFormData({ ...formData, logo_url: '' });
                                                }}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={20} className="text-white" />
                                            </button>
                                        </>
                                    ) : (
                                        <ImageIcon size={24} className="text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        id="logo-upload"
                                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    showToast('La imagen no debe pesar más de 2MB', 'error');
                                                    return;
                                                }
                                                setLogoFile(file);
                                                const url = URL.createObjectURL(file);
                                                setLogoPreview(url);
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="inline-flex items-center justify-center px-3 py-2 border border-slate-300 shadow-sm text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                                    >
                                        Seleccionar Imagen
                                    </label>
                                    <p className="mt-1 text-[10px] text-slate-500">
                                        PNG, JPG o SVG. Máx 2MB. Relación 1:1 (cuadrado) recomendada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <EliteButton type="button" variant="secondary" onClick={closeModal}>
                            Cancelar
                        </EliteButton>
                        <EliteButton type="submit" isLoading={saving} icon={<Save size={16} />}>
                            {editingId ? 'Actualizar' : 'Guardar'}
                        </EliteButton>
                    </div>
                </form>
            </EliteModal>
        </div>
    );
}
