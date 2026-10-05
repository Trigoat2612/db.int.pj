import type { RecordRow } from '../types';
import { formatNumber, total, uniq } from '../lib/data';

type Props = { records: RecordRow[]; metric: string };

export function Kpis({ records, metric }: Props) {
  const years = [...new Set(records.map((r) => r.year))];
  const csj = uniq(records.map((r) => r.csj));
  const sedes = uniq(records.map((r) => r.sede));
  const organos = uniq(records.map((r) => r.organo));
  const items = [
    { label: `TOTAL ${metric}`.toUpperCase(), value: formatNumber(total(records)), sub: `${records.length} registros agregados` },
    { label: 'AÑOS VISIBLES', value: formatNumber(years.length), sub: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : 'Sin datos' },
    { label: 'CSJ / DISTRITOS', value: formatNumber(csj.length), sub: csj.length ? 'con información disponible' : 'dimensión no informada' },
    { label: 'SEDES', value: formatNumber(sedes.length), sub: sedes.length ? 'sedes distintas' : 'dimensión no informada' },
    { label: 'ÓRGANOS', value: formatNumber(organos.length), sub: 'órganos distintos' },
  ];
  return <div className="kpi-grid">{items.map((item) => <div className="kpi" key={item.label}><div className="kpi-label">{item.label}</div><div className="kpi-value">{item.value}</div><div className="kpi-sub">{item.sub}</div></div>)}</div>;
}
