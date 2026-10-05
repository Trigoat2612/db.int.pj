# Validación del dataset

Fuente principal utilizada: `Reporte Estadistico de la Integraciones v2.xlsx`.

Los archivos `consulta 05102026xlsx.xlsx` y `Reporte Estadistico de la Integraciones.xlsx` fueron contrastados contra las hojas equivalentes del archivo v2. Los datos comunes coinciden; v2 contiene el conjunto más amplio de integraciones.

## Resultado de normalización

- Integraciones: 10
- Registros normalizados: 771
- Modelo común: `integration`, `year`, `csj`, `sede`, `organo`, `cantidad`
- Las dimensiones inexistentes se conservan como `null`; no se infieren valores.


## Normalización de texto

La carga normaliza Unicode, espacios iniciales/finales y espacios repetidos. Además, las comparaciones de CSJ, sede y órgano son **case-insensitive**. Variantes como `Lima Este`, `LIMA ESTE` o ` lima   este ` se tratan como una sola categoría y se conserva una etiqueta de presentación canónica.

Validación automática:

```bash
npm run data:validate
```

El comando falla si detecta variantes duplicadas por mayúsculas/minúsculas o espaciado.

## Control con Res Sentido de Fallo

| Año | Total |
| --- | ---: |
| 2024 | 1,435 |
| 2025 | 969 |
| 2026 | 579 |
| **Total** | **2,983** |

Estos totales coinciden con la hoja de resumen de referencia.

## Mapeos principales

| Integración | Año | CSJ | Sede | Órgano | Cantidad |
| --- | --- | --- | --- | --- | --- |
| Sentido de Fallo | `anio` | — | `sede` | `tipo_instancia` | `cantidad` |
| REPEJ | `Anio` | `Distrito_Judicial` | `Sede` | `Instancia` | `Cantidad` |
| SERNOT | `ANO` | — | `SEDE` | `INSTANCIA` | `TOTAL_CEDULAS` |
| REDJUM | `AÑO` | `CSJ` | — | `Organo Jurisdiccional` | `Cantidad` |
| Embargos | `AÑO` | `CSJ` | `Sede` | `Organo Jurisdiccional` | `Cantidad` |
| SINAREJ Multas | `AÑO` | `CSJ` | `Sede` | `Organo Jurisdiccional` | `Cantidad` |
| Jurisprudencia | `Año` | — | `Sede` | `OJ` | `Cantidad Expedientes` |
| Casillero Digital | `anio` | — | `sede` | `org_jurisdiccional` | `count()` |
| Depósitos | `Año` | — | `Sede` | `Instancia` | `Cantidad Expedientes` |
| SUNARP | `Año` | `distritoJudicial` | — | `x_nom_instancia` | `Cant.Envios Sunarp` |
