import type { RecordRow } from '../types';
import { formatNumber, groupYear } from '../lib/data';

type Props = { records: RecordRow[] };

export function YearChart({ records }: Props) {
  const data = groupYear(records);
  const max = Math.max(1, ...data.map(([, value]) => value));
  return (
    <div className="chart-card">
      <div className="chart-title"><span>EVOLUCIÓN ANUAL</span><small>{data.length} periodos</small></div>
      <div className="bars" role="img" aria-label="Totales por año">
        {data.map(([year, value]) => (
          <div className="bar-col" key={year}>
            <div className="bar-value">{formatNumber(value)}</div>
            <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(3, (value / max) * 100)}%` }}/></div>
            <div className="bar-year">{year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
