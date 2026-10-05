# Changelog

## 1.0.1 - 2026-10-05

- Filtros y agrupaciones ahora comparan textos sin distinguir mayúsculas/minúsculas.
- `Lima Este`, `LIMA ESTE` y variantes con espacios se consolidan en una sola categoría.
- El importador limpia Unicode y espacios y aplica una etiqueta canónica a CSJ, sede y órgano.
- Se agregó `npm run data:validate` para detectar duplicados de formato antes del build.
- Se actualizó la versión estática con la misma lógica de normalización.
- Se corrigió `tsconfig.node.json` con `noEmit: true` para evitar `TS5096` en Vercel.
