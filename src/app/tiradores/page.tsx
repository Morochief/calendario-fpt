import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
        <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flexGrow: 1 }}>
                {/* Hero Section */}
                <div style={{
                    background: '#171717',
                    color: 'white',
                    padding: '4rem 1.25rem',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                            letterSpacing: '-0.03em',
                            color: '#FFFFFF'
                        }}>
                            Tiradores Registrados
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '520px', margin: '0 auto', fontSize: '0.9375rem', lineHeight: 1.7 }}>
                            Lista oficial de atletas federados de la Federación Paraguaya de Tiro para la temporada 2026.
                        </p>
                    </div>
                </div>

                {/* Grid Section */}
                <div style={{ maxWidth: '1120px', margin: '-2rem auto 4rem', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem'
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
            <Footer />
        </div>
    );
}
