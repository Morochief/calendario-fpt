import React from 'react';
import ShooterCard from '@/components/ShooterCard';

const MOCK_SHOOTERS = [
    { id: 1, name: "Juan Pérez", division: "Production", category: "Overall", club: "Club de Tiro Asunción" },
    { id: 2, name: "María González", division: "Open", category: "Lady", club: "Club 3 de Mayo" },
    { id: 3, name: "Carlos López", division: "Standard", category: "Senior", club: "Club Centenario" },
    { id: 4, name: "Ana Martínez", division: "Production Optics", category: "Overall", club: "Club de Tiro Asunción" },
    { id: 5, name: "Roberto Fernández", division: "Classic", category: "Super Senior", club: "Club 3 de Mayo" },
    { id: 6, name: "Luis Ramírez", division: "Open", category: "Overall", club: "Club Centenario" },
];

export default function ShootersPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Header Section */}
            <div style={{
                background: '#1f2937',
                color: 'white',
                padding: '4rem 1rem',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}>
                        Tiradores Registrados
                    </h1>
                    <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>
                        Lista oficial de atletas federados de la Federación Paraguaya de Tiro para la temporada 2026.
                    </p>
                </div>
            </div>

            {/* Grid Section */}
            <div style={{ maxWidth: '1200px', margin: '-2rem auto 4rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {MOCK_SHOOTERS.map((shooter) => (
                        <ShooterCard
                            key={shooter.id}
                            name={shooter.name}
                            division={shooter.division}
                            category={shooter.category}
                            club={shooter.club}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
