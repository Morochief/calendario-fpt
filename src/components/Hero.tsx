'use client';

import { ArrowDown } from 'lucide-react';

export default function Hero() {
    const scrollToContent = () => {
        const calendarElement = document.getElementById('calendario');
        if (calendarElement) {
            calendarElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section
            className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: '#1E3A8A', borderBottom: '4px solid #D91E18' }}
        >
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />

            <div className="text-center max-w-[800px] p-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-10 flex justify-center relative">
                    {/* Logo Glow */}
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full transform scale-110" />

                    <div className="w-[200px] h-[200px] bg-white rounded-full flex items-center justify-center p-6 shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/LOGO_FPDT-removebg-preview.svg"
                            alt="Federación Paraguaya de Tiro"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg">
                    Federación Paraguaya de Tiro
                </h1>

                <p className="text-lg md:text-2xl text-blue-100 mb-12 font-light tracking-wide max-w-2xl mx-auto">
                    Excelencia Deportiva &bull; Tradición &bull; Disciplina
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={scrollToContent}
                        className="group flex items-center gap-3 px-8 py-4 bg-white text-[#1E3A8A] rounded-full font-bold text-lg transition-all hover:bg-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                        aria-label="Ver calendario de eventos"
                    >
                        <span>Calendario Oficial 2026</span>
                        <ArrowDown size={20} strokeWidth={2} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
