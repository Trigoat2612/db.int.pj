import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const inputPath = resolve(process.argv[2] ?? 'src/data/integrations.json');
const payload = JSON.parse(await readFile(inputPath, 'utf8'));

function cleanText(value) {
  if (value == null) return '';
  return String(value).normalize('NFKC').trim().replace(/\s+/g, ' ');
}

function textKey(value) {
  return cleanText(value).toLocaleUpperCase('es-PE');
}

let failures = 0;
for (const field of ['csj', 'sede', 'organo']) {
  const groups = new Map();
  for (const record of payload.records ?? []) {
    const value = cleanText(record[field]);
    if (!value) continue;
    const key = textKey(value);
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(value);
  }

  const variants = [...groups.entries()].filter(([, values]) => values.size > 1);
  if (variants.length) {
    failures += variants.length;
    console.error(`\n${field}: ${variants.length} grupos con variantes de mayúsculas/espacios`);
    for (const [, values] of variants) console.error(`  - ${[...values].join(' | ')}`);
  }
}

if (failures) {
  console.error(`\nValidación fallida: ${failures} grupos duplicados por formato.`);
  process.exit(1);
}

console.log(`Validación OK: ${payload.records?.length ?? 0} registros sin duplicados por mayúsculas/espacios en CSJ, sede u órgano.`);
