'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ModalityFilter from '@/components/ModalityFilter';
import MonthCard from '@/components/MonthCard';
import AnnualCalendar from '@/components/AnnualCalendar';
import { createClient } from '@/lib/supabase';
import { Modalidad, EventoConModalidad, MESES } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

type ViewType = 'mensual' | 'anual';

export default function CalendarPage() {
  const [modalidades, setModalidades] = useState<Modalidad[]>([]);
  const [eventos, setEventos] = useState<EventoConModalidad[]>([]);
  const [selectedModalidad, setSelectedModalidad] = useState<string | null>(null);
  const [vista, setVista] = useState<ViewType>('mensual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const { data: eventosData, error: evError } = await supabase
        .from('eventos')
        .select(`
          *,
          modalidades (*),
          tipos_evento (*)
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

  const eventosFiltrados = selectedModalidad
    ? eventos.filter(e => e.modalidad_id === selectedModalidad)
    : eventos;

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
      <main className="main main-content-area" id="calendario">
        <div className="calendar-header">
          <h2 className="section-title">Calendario de Eventos</h2>

          <div className="view-toggle">
            <button
              className={`view-btn ${vista === 'mensual' ? 'active' : ''}`}
              onClick={() => setVista('mensual')}
            >
              Vista Mensual
            </button>
            <button
              className={`view-btn ${vista === 'anual' ? 'active' : ''}`}
              onClick={() => setVista('anual')}
            >
              Vista Anual
            </button>
          </div>
        </div>

        {modalidades.length > 0 && (
          <ModalityFilter
            modalidades={modalidades}
            selected={selectedModalidad}
            onSelect={setSelectedModalidad}
          />
        )}

        {vista === 'mensual' ? (
          <div className="calendar-grid">
            {MESES.map((mes, index) => (
              <MonthCard
                key={mes}
                mes={mes}
                mesIndex={index}
                eventos={eventosFiltrados}
              />
            ))}
          </div>
        ) : (
          <AnnualCalendar eventos={eventosFiltrados} year={2026} />
        )}
      </main>
      <Footer />
    </>
  );
}
