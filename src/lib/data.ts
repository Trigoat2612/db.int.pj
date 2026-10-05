import type { Filters, RecordRow } from '../types';

export const ALL = '__ALL__';

export function formatNumber(value: number) {
  return new Intl.NumberFormat('es-PE').format(value);
}

export function uniq(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' }),
  );
}

export function filterRecords(records: RecordRow[], filters: Filters) {
  return records.filter((row) => {
    if (filters.integration !== ALL && row.integration !== filters.integration) return false;
    if (filters.years.length && !filters.years.includes(row.year)) return false;
    if (filters.csj !== ALL && row.csj !== filters.csj) return false;
    if (filters.sede !== ALL && row.sede !== filters.sede) return false;
    if (filters.organo !== ALL && row.organo !== filters.organo) return false;
    return true;
  });
}

export function total(records: RecordRow[]) {
  return records.reduce((sum, row) => sum + row.cantidad, 0);
}

export function groupYear(records: RecordRow[]) {
  const map = new Map<number, number>();
  for (const row of records) map.set(row.year, (map.get(row.year) ?? 0) + row.cantidad);
  return [...map.entries()].sort(([a], [b]) => a - b);
}

export type PivotNode = {
  key: string;
  label: string;
  level: number;
  values: Record<number, number>;
  total: number;
  children: PivotNode[];
};

function buildNode(label: string, key: string, level: number, rows: RecordRow[], years: number[], children: PivotNode[] = []): PivotNode {
  const values = Object.fromEntries(years.map((year) => [year, rows.filter((r) => r.year === year).reduce((s, r) => s + r.cantidad, 0)]));
  return { key, label, level, values, total: total(rows), children };
}

function buildDimensionPivot(records: RecordRow[], years: number[], levelOffset = 0, prefix = ''): PivotNode[] {
  if (!records.length) return [];
  const hasCsj = records.some((r) => r.csj);
  const hasSede = records.some((r) => r.sede);
  const keyPrefix = prefix ? `${prefix}/` : '';

  if (hasCsj) {
    const roots = uniq(records.map((r) => r.csj)).map((csj) => {
      const csjRows = records.filter((r) => r.csj === csj);
      if (hasSede && csjRows.some((r) => r.sede)) {
        const sedes = uniq(csjRows.map((r) => r.sede)).map((sede) => {
          const sedeRows = csjRows.filter((r) => r.sede === sede);
          const organos = uniq(sedeRows.map((r) => r.organo)).map((organo) =>
            buildNode(organo, `${keyPrefix}csj:${csj}/sede:${sede}/org:${organo}`, levelOffset + 2, sedeRows.filter((r) => r.organo === organo), years),
          );
          return buildNode(sede, `${keyPrefix}csj:${csj}/sede:${sede}`, levelOffset + 1, sedeRows, years, organos);
        });
        return buildNode(csj, `${keyPrefix}csj:${csj}`, levelOffset, csjRows, years, sedes);
      }
      const organos = uniq(csjRows.map((r) => r.organo)).map((organo) =>
        buildNode(organo, `${keyPrefix}csj:${csj}/org:${organo}`, levelOffset + 1, csjRows.filter((r) => r.organo === organo), years),
      );
      return buildNode(csj, `${keyPrefix}csj:${csj}`, levelOffset, csjRows, years, organos);
    });

    // Conserva registros sin CSJ si una integración mezcla filas con y sin esa dimensión.
    const withoutCsj = records.filter((r) => !r.csj);
    return withoutCsj.length ? [...roots, ...buildDimensionPivot(withoutCsj, years, levelOffset, `${keyPrefix}sin-csj`)] : roots;
  }

  if (hasSede) {
    return uniq(records.map((r) => r.sede)).map((sede) => {
      const sedeRows = records.filter((r) => r.sede === sede);
      const organos = uniq(sedeRows.map((r) => r.organo)).map((organo) =>
        buildNode(organo, `${keyPrefix}sede:${sede}/org:${organo}`, levelOffset + 1, sedeRows.filter((r) => r.organo === organo), years),
      );
      return buildNode(sede, `${keyPrefix}sede:${sede}`, levelOffset, sedeRows, years, organos);
    });
  }

  return uniq(records.map((r) => r.organo)).map((organo) =>
    buildNode(organo, `${keyPrefix}org:${organo}`, levelOffset, records.filter((r) => r.organo === organo), years),
  );
}

export function buildPivot(records: RecordRow[], years: number[]): PivotNode[] {
  if (!records.length) return [];
  const integrations = uniq(records.map((r) => r.integration));
  if (integrations.length > 1) {
    return integrations.map((integration) => {
      const rows = records.filter((r) => r.integration === integration);
      const children = buildDimensionPivot(rows, years, 1, `integration:${integration}`);
      return buildNode(integration, `integration:${integration}`, 0, rows, years, children);
    });
  }
  return buildDimensionPivot(records, years);
}
