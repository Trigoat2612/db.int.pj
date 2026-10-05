import type { Filters, RecordRow } from '../types';
import { ALL, uniq } from '../lib/data';
import { Icon } from './Icon';

type Props = {
  records: RecordRow[];
  filters: Filters;
  availableYears: number[];
  onChange: (next: Filters) => void;
  onReset: () => void;
};

export function FiltersPanel({ records, filters, availableYears, onChange, onReset }: Props) {
  const base = records.filter((r) => filters.integration === ALL || r.integration === filters.integration);
  const csjs = uniq(base.map((r) => r.csj));
  const byCsj = base.filter((r) => filters.csj === ALL || r.csj === filters.csj);
  const sedes = uniq(byCsj.map((r) => r.sede));
  const bySede = byCsj.filter((r) => filters.sede === ALL || r.sede === filters.sede);
  const organos = uniq(bySede.map((r) => r.organo));

  const toggleYear = (year: number) => {
    const years = filters.years.includes(year) ? filters.years.filter((y) => y !== year) : [...filters.years, year].sort();
    onChange({ ...filters, years });
  };

  return (
    <section className="filters-panel" aria-label="Filtros">
      <div className="filter-heading"><Icon name="filter"/><span>Filtros de análisis</span><button onClick={onReset}>RESTABLECER</button></div>
      <div className="year-pills">
        {availableYears.map((year) => <button key={year} className={filters.years.includes(year) ? 'active' : ''} onClick={() => toggleYear(year)}><span className="dot"/>{year}</button>)}
      </div>
      <div className="select-grid">
        {csjs.length > 0 && <label><span>CSJ / DISTRITO JUDICIAL</span><select value={filters.csj} onChange={(e) => onChange({ ...filters, csj: e.target.value, sede: ALL, organo: ALL })}><option value={ALL}>Todas</option>{csjs.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>}
        {sedes.length > 0 && <label><span>SEDE</span><select value={filters.sede} onChange={(e) => onChange({ ...filters, sede: e.target.value, organo: ALL })}><option value={ALL}>Todas</option>{sedes.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>}
        {organos.length > 0 && <label><span>ÓRGANO JURISDICCIONAL</span><select value={filters.organo} onChange={(e) => onChange({ ...filters, organo: e.target.value })}><option value={ALL}>Todos</option>{organos.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>}
      </div>
    </section>
  );
}
