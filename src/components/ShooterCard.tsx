import React from 'react';
import { Target } from 'lucide-react';

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
            borderRadius: '14px',
            padding: '1.5rem',
            border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'box-shadow 0.25s ease, border-color 0.25s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                    width: '38px',
                    height: '38px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#737373'
                }}>
                    <Target size={18} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#171717', letterSpacing: '-0.01em' }}>{name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#A3A3A3' }}>Tirador FPT</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <div>
                    <span style={{ display: 'block', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.125rem' }}>División</span>
                    <span style={{ color: '#171717', fontWeight: 500 }}>{division}</span>
                </div>
                <div>
                    <span style={{ display: 'block', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.125rem' }}>Categoría</span>
                    <span style={{ color: '#171717', fontWeight: 500 }}>{category}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ display: 'block', color: '#A3A3A3', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.125rem' }}>Club</span>
                    <span style={{ color: '#171717', fontWeight: 500 }}>{club}</span>
                </div>
            </div>
        </div>
    );
}
