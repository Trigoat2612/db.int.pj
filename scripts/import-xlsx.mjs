import ExcelJS from 'exceljs';
import { writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const sourcePath = resolve(process.argv[2] ?? 'data/source.xlsx');
const outputPath = resolve('src/data/integrations.json');

const CONFIG = [
  { sheet: 'fallolaboral', name: 'Sentido de Fallo', year: 'anio', sede: 'sede', organo: 'tipo_instancia', qty: 'cantidad', metric: 'Expedientes' },
  { sheet: 'REPEJ', name: 'REPEJ', csj: 'Distrito_Judicial', year: 'Anio', sede: 'Sede', organo: 'Instancia', qty: 'Cantidad', metric: 'Registros' },
  { sheet: 'SERNOT', name: 'SERNOT', year: 'ANO', sede: 'SEDE', organo: 'INSTANCIA', qty: 'TOTAL_CEDULAS', metric: 'Cédulas' },
  { sheet: 'REDJUM', name: 'REDJUM', csj: 'CSJ', year: 'AÑO', organo: 'Organo Jurisdiccional', qty: 'Cantidad', metric: 'Registros' },
  { sheet: 'embargos', name: 'Embargos', csj: 'CSJ', year: 'AÑO', sede: 'Sede', organo: 'Organo Jurisdiccional', qty: 'Cantidad', metric: 'Registros' },
  { sheet: 'sinarej multas', name: 'SINAREJ Multas', csj: 'CSJ', year: 'AÑO', sede: 'Sede', organo: 'Organo Jurisdiccional', qty: 'Cantidad', metric: 'Registros' },
  { sheet: 'jurisprudencia', name: 'Jurisprudencia', year: 'Año', sede: 'Sede', organo: 'OJ', qty: 'Cantidad Expedientes', metric: 'Expedientes' },
  { sheet: 'casillero', name: 'Casillero Digital', year: 'anio', sede: 'sede', organo: 'org_jurisdiccional', qty: 'count()', metric: 'Registros' },
  { sheet: 'depositos', name: 'Depósitos', year: 'Año', sede: 'Sede', organo: 'Instancia', qty: 'Cantidad Expedientes', metric: 'Expedientes' },
  { sheet: 'sunarp', name: 'SUNARP', csj: 'distritoJudicial', year: 'Año', organo: 'x_nom_instancia', qty: 'Cant.Envios Sunarp', metric: 'Envíos SUNARP', extra: { tipo_instancia: 'Instancia' } },
];

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(sourcePath);

const records = [];
const integrations = [];

for (const cfg of CONFIG) {
  const sheet = workbook.getWorksheet(cfg.sheet) ?? workbook.worksheets.find((ws) => ws.name.toLowerCase() === cfg.sheet.toLowerCase());
  if (!sheet) {
    console.warn(`Omitida: no existe la hoja ${cfg.sheet}`);
    continue;
  }
  const headerRow = sheet.getRow(1).values.slice(1).map((v) => String(v ?? '').trim());
  const col = (name) => headerRow.indexOf(name) + 1;
  const required = [cfg.year, cfg.organo, cfg.qty].filter(Boolean);
  const missing = required.filter((name) => col(name) <= 0);
  if (missing.length) throw new Error(`${sheet.name}: faltan columnas ${missing.join(', ')}`);

  let count = 0;
  for (let r = 2; r <= sheet.rowCount; r += 1) {
    const row = sheet.getRow(r);
    const year = row.getCell(col(cfg.year)).value;
    const qty = row.getCell(col(cfg.qty)).value;
    if (year == null || qty == null || year === '' || qty === '') continue;

    const record = {
      integration: cfg.name,
      sourceSheet: sheet.name,
      year: Number(year),
      csj: cfg.csj ? String(row.getCell(col(cfg.csj)).value ?? '').trim() || null : null,
      sede: cfg.sede ? String(row.getCell(col(cfg.sede)).value ?? '').trim() || null : null,
      organo: cfg.organo ? String(row.getCell(col(cfg.organo)).value ?? '').trim() || null : null,
      cantidad: Number(qty),
    };
    if (cfg.extra) for (const [key, source] of Object.entries(cfg.extra)) record[key] = String(row.getCell(col(source)).value ?? '').trim() || null;
    records.push(record);
    count += 1;
  }
  integrations.push({ name: cfg.name, sourceSheet: sheet.name, metric: cfg.metric, hasCSJ: Boolean(cfg.csj), hasSede: Boolean(cfg.sede), rows: count });
}

const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  source: basename(sourcePath),
  integrations,
  records,
};

await writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Datos regenerados: ${records.length} registros / ${integrations.length} integraciones -> ${outputPath}`);
