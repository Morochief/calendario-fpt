import React from 'react';

interface ShooterCardProps {
    name: string;
    division: string;
    category: string;
    club: string;
}

export default function ShooterCard({ name, division, category, club }: ShooterCardProps) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f3f4f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                }}>
                    🎯
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>{name}</h3>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Legacy Member</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div>
                    <span style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem' }}>División</span>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{division}</span>
                </div>
                <div>
                    <span style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem' }}>Categoría</span>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{category}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ display: 'block', color: '#9ca3af', fontSize: '0.75rem' }}>Club</span>
                    <span style={{ color: '#374151', fontWeight: 500 }}>{club}</span>
                </div>
            </div>
        </div>
    );
}
