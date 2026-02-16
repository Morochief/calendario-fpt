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
        <section className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden border-b border-gray-200">
            <div className="text-center max-w-[800px] p-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8 flex justify-center">
                    <div className="w-[180px] h-[180px] bg-white rounded-full flex items-center justify-center p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/LOGO_FPDT-removebg-preview.svg"
                            alt="Federación Paraguaya de Tiro"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                    Federación Paraguaya de Tiro
                </h1>

                <p className="text-lg md:text-xl text-gray-600 mb-10 font-light tracking-wide">
                    Excelencia Deportiva &bull; Tradición &bull; Disciplina
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={scrollToContent}
                        className="group flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium transition-all hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5"
                        aria-label="Ver calendario de eventos"
                    >
                        <span className="text-sm font-medium">Calendario Oficial 2026</span>
                        <ArrowDown size={16} strokeWidth={1.5} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
