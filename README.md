# Dashboard de Integraciones Judiciales

Dashboard responsive para consolidar las integraciones estadísticas del EJE No Penal a partir de un Excel con múltiples pestañas.

## Qué resuelve

- Totaliza por año.
- Desagrega por CSJ / Distrito Judicial cuando la hoja lo contiene.
- Desagrega por sede cuando la hoja lo contiene.
- Desagrega por órgano jurisdiccional / instancia / OJ.
- Replica el criterio jerárquico de la hoja **Res Sentido de Fallo**, con niveles expandibles y años en columnas.
- Permite exportar el resultado filtrado a CSV.
- No inventa dimensiones ausentes: si una hoja no tiene CSJ o sede, ese filtro no aparece.
- Compara textos sin distinguir mayúsculas/minúsculas y normaliza espacios, evitando duplicados como `Lima Este` / `LIMA ESTE`.

## Stack

- React 19 + TypeScript.
- Vite para desarrollo y build estático.
- CSS propio, siguiendo `Agente.md` (paleta, tipografía, bordes, sidebar, responsive).
- ExcelJS solo para el proceso de actualización del dataset.
- Sin librería externa de gráficos: la evolución anual se renderiza con componentes propios.

## Estructura

```text
src/
  components/        UI reutilizable
  data/              JSON normalizado generado desde Excel
  lib/               filtros, agregaciones y tabla dinámica
scripts/
  import-xlsx.mjs    importador / normalizador
  validate-data.mjs  validación de duplicados por formato
data/
  source.xlsx        Excel fuente
```

## Actualizar datos

1. Reemplaza `data/source.xlsx` por la nueva versión del archivo, conservando las hojas/columnas configuradas.
2. Ejecuta:

```bash
npm run data:refresh
npm run data:validate
npm run build
```

El importador vuelve a generar `src/data/integrations.json`, limpia espacios y unifica variantes que solo difieren por mayúsculas/minúsculas. El validador comprueba que no queden duplicados de formato en CSJ, sede u órgano.

Para incorporar nuevas integraciones, agrega su mapeo en `CONFIG` dentro de `scripts/import-xlsx.mjs`.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

El resultado queda en `dist/` y puede desplegarse directamente en Vercel.

## Actualizar el sitio desplegado en Vercel

Después de actualizar y validar el Excel:

```bash
git add .
git commit -m "data: actualizar estadísticas de integraciones"
git push origin main
```

Si el proyecto de Vercel está conectado a `main`, el nuevo commit dispara automáticamente un nuevo deployment.

## Integraciones cargadas

1. Sentido de Fallo
2. REPEJ
3. SERNOT
4. REDJUM
5. Embargos
6. SINAREJ Multas
7. Jurisprudencia
8. Casillero Digital
9. Depósitos
10. SUNARP

## Despliegue sin build

La carpeta `deploy-static/` es una versión preconstruida sin dependencias. Puede publicarse como sitio estático directamente o abrirse localmente mediante `deploy-static/index.html`.

La versión React/TypeScript dentro de `src/` es la base recomendada para evolución del proyecto; `deploy-static/` sirve como respaldo inmediato y verificable.
