'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface Contacto {
    id: string;
    nombre: string;
    contacto_nombre: string | null;
    contacto_telefono: string | null;
}

export default function Footer() {
    const [contactos, setContactos] = useState<Contacto[]>([]);

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
            setContactos(data);
        }
    }

    const formatPhone = (phone: string) => {
        return phone.replace(/\D/g, '');
    };

    return (
        <footer className="contact-footer">
            <h3>📞 Contactos por Modalidad</h3>

            <div className="contact-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
            }}>
                {contactos.map(c => (
                    <a
                        key={c.id}
                        href={`https://wa.me/595${formatPhone(c.contacto_telefono || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '0.75rem 1rem',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'white',
                            transition: 'background 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.25rem' }}>
                            {c.nombre}
                        </span>
                        <span style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                            {c.contacto_nombre}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#25D366' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            {c.contacto_telefono}
                        </span>
                    </a>
                ))}
            </div>

            {contactos.length === 0 && (
                <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>
                    Cargando contactos...
                </p>
            )}

            <p style={{ marginTop: '1.5rem', opacity: 0.7, fontSize: '0.875rem' }}>
                © 2026 Club Paraguayo de Tiro Práctico. Todos los derechos reservados.
            </p>
        </footer>
    );
}
