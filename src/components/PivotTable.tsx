import { useMemo, useState } from 'react';
import type { RecordRow } from '../types';
import { buildPivot, formatNumber, total, type PivotNode } from '../lib/data';
import { Icon } from './Icon';

type Props = { records: RecordRow[]; years: number[] };

type FlatNode = PivotNode & { visible: boolean };

export function PivotTable({ records, years }: Props) {
  const roots = useMemo(() => buildPivot(records, years), [records, years]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const rows = useMemo(() => {
    const flat: FlatNode[] = [];
    const walk = (node: PivotNode, parentsVisible: boolean) => {
      flat.push({ ...node, visible: parentsVisible });
      if (!parentsVisible || collapsed.has(node.key)) return;
      node.children.forEach((child) => walk(child, true));
    };
    roots.forEach((node) => walk(node, true));
    return flat.filter((r) => r.visible);
  }, [roots, collapsed]);

  const toggle = (key: string) => setCollapsed((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <div className="pivot-wrap">
      <div className="pivot-head"><span>TABLA DINÁMICA</span><small>{rows.length} filas visibles</small></div>
      <div className="pivot-scroll">
        <table className="pivot-table">
          <thead><tr><th>Etiquetas de fila</th>{years.map((year) => <th key={year}>{year}</th>)}<th>Total general</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={`level-${row.level}`}>
                <td>
                  <div className="row-label" style={{ paddingLeft: `${row.level * 22}px` }}>
                    {row.children.length > 0 ? <button className={`fold ${collapsed.has(row.key) ? 'collapsed' : ''}`} onClick={() => toggle(row.key)} aria-label="Expandir o contraer"><Icon name="chevron"/></button> : <span className="fold-spacer"/>}
                    <span>{row.label}</span>
                  </div>
                </td>
                {years.map((year) => <td key={year}>{row.values[year] ? formatNumber(row.values[year]) : '0'}</td>)}
                <td className="total-col">{formatNumber(row.total)}</td>
              </tr>
            ))}
            <tr className="grand-total"><td>Total general</td>{years.map((year) => <td key={year}>{formatNumber(records.filter((r) => r.year === year).reduce((s, r) => s + r.cantidad, 0))}</td>)}<td>{formatNumber(total(records))}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
