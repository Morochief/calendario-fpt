'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Phone, MapPin, ExternalLink } from 'lucide-react';

interface Contacto {
    id: string;
    nombre: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
}

interface ContactoAgrupado {
    nombre: string;
    telefono: string;
    modalidades: string[];
}

export default function Footer() {
    const [contactosAgrupados, setContactosAgrupados] = useState<ContactoAgrupado[]>([]);

    useEffect(() => {
        loadContactos();
    }, []);

    async function loadContactos() {
        const supabase = createClient();
        const { data } = await supabase
            .from('modalidades')
            .select('id, nombre, contacto_nombre, contacto_telefono')
            .not('contacto_nombre', 'is', null)
            .order('nombre');

        if (data) {
            // Agrupar por contacto
            const agrupados: { [key: string]: ContactoAgrupado } = {};

            data.forEach((c: Contacto) => {
                const key = c.contacto_nombre || '';
                if (!agrupados[key]) {
                    agrupados[key] = {
                        nombre: c.contacto_nombre || '',
                        telefono: c.contacto_telefono || '',
                        modalidades: []
                    };
                }
                agrupados[key].modalidades.push(c.nombre);
            });

            setContactosAgrupados(Object.values(agrupados));
        }
    }

    const formatPhone = (phone: string) => {
        return phone.replace(/\D/g, '');
    };

    return (
        <footer className="contact-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Phone size={24} className="text-white opacity-80" />
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Contactos por Modalidad</h3>
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                {contactosAgrupados.map((c, idx) => (
                    <a
                        key={idx}
                        href={`https://wa.me/595${formatPhone(c.telefono)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: 'white',
                            minWidth: '180px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.2s ease'
                        }}
                        className="footer-contact-card"
                    >
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {c.modalidades.join(' • ')}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                            {c.nombre}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ADE80', fontSize: '0.9rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {c.telefono}
                        </span>
                    </a>
                ))}
            </div>

            {/* Location Link */}
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <a
                    href="https://maps.app.goo.gl/weBjZMXHERaafE858?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.8rem 1.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '100px',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease'
                    }}
                    className="footer-location-btn"
                >
                    <MapPin size={20} />
                    Ver ubicación del Club en Google Maps
                    <ExternalLink size={16} style={{ opacity: 0.7 }} />
                </a>
            </div>

            <p style={{ marginTop: '3rem', opacity: 0.5, fontSize: '0.875rem', textAlign: 'center' }}>
                © {new Date().getFullYear()} Federación Paraguaya de Tiro. Todos los derechos reservados.
            </p>
        </footer>
    );
}
