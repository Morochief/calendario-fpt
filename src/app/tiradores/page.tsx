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
        <div className="min-h-screen bg-bg-elite flex flex-col">
            <Header />
            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-cop-blue text-white py-16 px-5 text-center">
                    <div className="max-w-[1120px] mx-auto">
                        <h1 className="text-[2rem] font-semibold mb-3 tracking-[-0.03em] text-white">
                            Tiradores Registrados
                        </h1>
                        <p className="text-white/50 max-w-[520px] mx-auto text-[0.9375rem] leading-relaxed">
                            Lista oficial de atletas federados de la Federación Paraguaya de Tiro para la temporada 2026.
                        </p>
                    </div>
                </div>

                {/* Grid Section */}
                <div className="max-w-[1120px] mx-auto -mt-8 mb-16 px-5 relative z-10 animate-page-enter">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
                        {MOCK_SHOOTERS.map((shooter, index) => (
                            <div
                                key={shooter.id}
                                className="animate-stagger-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <ShooterCard
                                    name={shooter.name}
                                    division={shooter.division}
                                    category={shooter.category}
                                    club={shooter.club}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
