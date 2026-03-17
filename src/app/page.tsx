'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ModalityFilter from '@/components/ModalityFilter';
import ClubFilter from '@/components/ClubFilter';
import MonthCard from '@/components/MonthCard';
import AnnualCalendar from '@/components/AnnualCalendar';
import { createClient } from '@/lib/supabase';
import { Modalidad, EventoConModalidad, MESES, Club } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionTitle from '@/components/SectionTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import EventModal from '@/components/EventModal';

type ViewType = 'mensual' | 'anual';

export default function CalendarPage() {
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [eventos, setEventos] = useState<EventoConModalidad[]>([]);
  const [selectedModalidad, setSelectedModalidad] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [vista, setVista] = useState<ViewType>('mensual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventoConModalidad | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = createClient();

      const { data: modalidadesData, error: modError } = await supabase
        .from('modalidades')
        .select('*')
        .order('nombre');

      if (modError) throw modError;
      setModalidades(modalidadesData || []);

      const { data: clubesData, error: clubError } = await supabase
        .from('clubes_publicos')
        .select('*')
        .order('nombre');

      if (clubError) throw clubError;
      setClubes(clubesData || []);

      const { data: eventosData, error: evError } = await supabase
        .from('eventos')
        .select(`
          *,
          modalidades (*),
          tipos_evento (*),
          clubes (id, nombre, siglas, website_url, logo_url, color, estado)
        `)
        .order('fecha');

      if (evError) throw evError;
      setEventos(eventosData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Verifica la configuración de Supabase.');
    } finally {
      setLoading(false);
    }
  }

  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
        const matchModalidad = selectedModalidad ? e.modalidad_id === selectedModalidad : true;
        const matchClub = selectedClub ? e.club_id === selectedClub : true;
        return matchModalidad && matchClub;
    });
  }, [eventos, selectedModalidad, selectedClub]);

  const eventosPorMes = useMemo(() => {
    const buckets: { [key: number]: EventoConModalidad[] } = {};
    for (let i = 0; i < 12; i++) buckets[i] = [];
    
    eventosFiltrados.forEach(e => {
        const fecha = new Date(e.fecha + 'T12:00:00');
        const m = fecha.getMonth();
        buckets[m].push(e);
    });

    // Ordenar cada mes
    Object.keys(buckets).forEach(m => {
        buckets[Number(m)].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    });

    return buckets;
  }, [eventosFiltrados]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="main">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="main">
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <AlertTriangle size={32} strokeWidth={1.5} style={{ color: '#A3A3A3', marginBottom: '1rem' }} />
            <h2 style={{ color: '#171717', marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
              Error de Configuración
            </h2>
            <p style={{ marginBottom: '1.25rem', color: '#737373', fontSize: '0.875rem', lineHeight: 1.6 }}>{error}</p>
            <p style={{ fontSize: '0.8125rem', color: '#A3A3A3', lineHeight: 1.6 }}>
              Asegúrate de configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y
              NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Hero />
      <main className="main relative z-10 bg-white" id="calendario">
        <ScrollReveal>
          <div className="calendar-header pt-16 md:pt-24">
            <SectionTitle
              title="Calendario de Eventos"
              subtitle="Temporada Oficial 2026"
              type="institucional"
              className="mb-0" // Override margin if needed by layout
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6 relative z-[var(--z-filter)] items-start lg:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              {modalidades.length > 0 && (
                <ModalityFilter
                  modalidades={modalidades}
                  selected={selectedModalidad}
                  onSelect={setSelectedModalidad}
                />
              )}
              {clubes.length > 0 && (
                <ClubFilter
                  clubes={clubes}
                  selected={selectedClub}
                  onSelect={setSelectedClub}
                />
              )}
            </div>

            <div className="flex bg-white p-1 rounded-full border border-[var(--color-border)] shadow-[var(--shadow-sm)] w-fit relative z-10 shrink-0">
              <button
                onClick={() => setVista('mensual')}
                className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${vista === 'mensual'
                  ? 'text-[var(--color-cop-blue)] shadow-sm bg-blue-50/50'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
              >
                {vista === 'mensual' && (
                  <div className="absolute inset-0 bg-white rounded-full shadow-[var(--shadow-xs)] border border-[var(--color-border-hover)] -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                Vista Mensual
              </button>
              <button
                onClick={() => setVista('anual')}
                className={`relative px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${vista === 'anual'
                  ? 'text-[var(--color-cop-blue)] shadow-sm bg-blue-50/50'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
              >
                {vista === 'anual' && (
                  <div className="absolute inset-0 bg-white rounded-full shadow-[var(--shadow-xs)] border border-[var(--color-border-hover)] -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                Vista Anual
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[600px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {vista === 'mensual' ? (
                <motion.div
                  key="mensual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
                >
                  {MESES.map((mes, index) => (
                    <MonthCard
                      key={mes}
                      mes={mes}
                      mesIndex={index}
                      eventos={eventosPorMes[index]}
                      onEventClick={setSelectedEvent}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="anual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <AnnualCalendar eventos={eventosFiltrados} year={2026} onEventClick={setSelectedEvent} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {selectedEvent && (
            <EventModal
                evento={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />
        )}
      </main>
      <Footer />
    </>
  );
}
