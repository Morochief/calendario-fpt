'use client';

import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
    const scrollToContent = () => {
        const calendarElement = document.getElementById('calendario');
        if (calendarElement) {
            calendarElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-image-wrapper">
                    <div className="hero-image-container">
                        <Image
                            src="/logo fpdt.svg"
                            alt="Federación Paraguaya de Tiro"
                            fill
                            unoptimized
                            style={{ objectFit: 'contain' }}
                            priority
                            className="hero-logo"
                        />
                    </div>
                </div>

                <h1 className="hero-title">
                    Federación Paraguaya de Tiro
                </h1>

                <p className="hero-subtitle">
                    Excelencia Deportiva &bull; Tradición &bull; Disciplina
                </p>

                <div className="hero-action">
                    <button
                        onClick={scrollToContent}
                        className="hero-scroll-btn"
                        aria-label="Ver calendario de eventos"
                    >
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Calendario Oficial 2026</span>
                        <ArrowDown size={16} strokeWidth={1.5} className="hero-arrow-icon" />
                    </button>
                </div>
            </div>
        </section>
    );
}
