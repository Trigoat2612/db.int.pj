import { useMemo, useState } from 'react';
import payload from './data/integrations.json';
import type { DataPayload, Filters } from './types';
import { ALL, filterRecords, formatNumber, sameText, total, uniq } from './lib/data';
import { Sidebar } from './components/Sidebar';
import { FiltersPanel } from './components/FiltersPanel';
import { Kpis } from './components/Kpis';
import { YearChart } from './components/YearChart';
import { PivotTable } from './components/PivotTable';
import { Icon } from './components/Icon';
import './styles.css';

const data = payload as DataPayload;
const TODAY = new Date('2026-10-05T00:00:00-05:00');

const initialFilters: Filters = { integration: ALL, years: [], csj: ALL, sede: ALL, organo: ALL };

function toCsv(rows: ReturnType<typeof filterRecords>) {
  const headers = ['Integración', 'Año', 'CSJ', 'Sede', 'Órgano', 'Cantidad'];
  const esc = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers, ...rows.map((r) => [r.integration, r.year, r.csj, r.sede, r.organo, r.cantidad])].map((row) => row.map(esc).join(';')).join('\n');
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [menuOpen, setMenuOpen] = useState(false);

  const integrationRecords = useMemo(() => data.records.filter((r) => filters.integration === ALL || sameText(r.integration, filters.integration)), [filters.integration]);
  const availableYears = useMemo(() => [...new Set(integrationRecords.map((r) => r.year))].sort((a, b) => a - b), [integrationRecords]);
  const visibleRecords = useMemo(() => filterRecords(data.records, filters), [filters]);
  const visibleYears = filters.years.length ? filters.years.filter((y) => availableYears.includes(y)) : availableYears;
  const metric = filters.integration === ALL ? 'registros' : (data.integrations.find((i) => sameText(i.name, filters.integration))?.metric ?? 'registros');
  const title = filters.integration === ALL ? 'Integraciones judiciales' : filters.integration;
  const subtitle = filters.integration === ALL
    ? 'Vista consolidada y desagregable por año, corte superior, sede y órgano jurisdiccional.'
    : `Análisis dinámico de ${filters.integration}, respetando únicamente las dimensiones disponibles en su hoja de origen.`;

  const selectIntegration = (integration: string) => setFilters({ ...initialFilters, integration });

  const reset = () => setFilters((current) => ({ ...initialFilters, integration: current.integration }));

  const exportCsv = () => {
    const blob = new Blob(['\ufeff', toCsv(visibleRecords)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `integraciones-${filters.integration === ALL ? 'general' : filters.integration.toLowerCase().replaceAll(' ', '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <Sidebar integrations={data.integrations} active={filters.integration} onChange={selectIntegration} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main-content">
        <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir navegación"><Icon name="menu"/></button>

        <header className="hero">
          <div className="eyebrow"><span className="num">01</span> · PANEL ESTADÍSTICO</div>
          <div className="hero-grid">
            <div>
              <h1>{title.split(' ').slice(0, -1).join(' ')} <em>{title.split(' ').slice(-1)}</em></h1>
              <p className="lede">{subtitle}</p>
            </div>
            <div className="hero-total"><span>TOTAL FILTRADO</span><strong>{formatNumber(total(visibleRecords))}</strong><small>{metric}</small></div>
          </div>
          <div className="hero-meta"><span>FUENTE · {data.source}</span><span>ACTUALIZADO · {data.generatedAt}</span><span>HOY · {TODAY.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span></div>
        </header>

        <section className="section">
          <div className="eyebrow"><span className="num">02</span> · FILTROS</div>
          <h2>Desagregación <em>dinámica</em></h2>
          <p className="lede">Los filtros se encadenan según las dimensiones reales de cada integración. No se muestran campos inexistentes.</p>
          <FiltersPanel records={data.records} filters={filters} availableYears={availableYears} onChange={setFilters} onReset={reset} />
        </section>

        <section className="section">
          <div className="eyebrow"><span className="num">03</span> · RESUMEN</div>
          <h2>Lectura <em>ejecutiva</em></h2>
          <Kpis records={visibleRecords} metric={metric} />
          <YearChart records={visibleRecords} />
        </section>

        <section className="section">
          <div className="section-row">
            <div><div className="eyebrow"><span className="num">04</span> · DETALLE</div><h2>Tabla <em>jerárquica</em></h2></div>
            <button className="export-button" onClick={exportCsv}><Icon name="download"/>EXPORTAR CSV</button>
          </div>
          <p className="lede">Replica el criterio de tabla dinámica de “Res Sentido de Fallo”: niveles expandibles y años como columnas.</p>
          <PivotTable records={visibleRecords} years={visibleYears} />
        </section>

        <footer className="page-footer"><span>{data.integrations.length} integraciones</span><span>{data.records.length} registros normalizados</span><span>{uniq(data.records.map((r) => r.sourceSheet)).length} hojas de origen</span></footer>
      </main>
    </div>
  );
}
