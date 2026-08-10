# Scripts — Codificación RDS-PS (IEC 81346-10)

Generadores reutilizables para la codificación de subestaciones y circuitos
del catálogo. Implementan el formato aprobado por el usuario:

```
Subestación:  =VE+<REGION>-<NOMBRE>          (ej. =VE+GUARICO-SAN JUAN)
Circuito:     =VE+<REGION>-<SUBESTACION>:<CTO>  (ej. =VE+GUARICO-SAN JUAN:LOS LLANOS)
```

## Módulos

| Archivo | Descripción |
|---|---|
| `rds_ps.py` | Normalización, resolución de colisiones y generación de SQL. |
| `generar_codigos_subestaciones.py` | Genera códigos para `maestro.subestaciones`. |
| `generar_codigos_circuitos.py` | Genera códigos para `maestro.circuitos` (usa los códigos de SE). |

## Uso

```bash
# 1. Subestaciones (entrada: dump JSON con id, nombre, region_id)
python3 scripts/generar_codigos_subestaciones.py \
    --input /tmp/subestaciones_supabase_full.json \
    --salida /tmp/subestaciones_codificadas.json \
    --sql-dir /tmp/opencode

# 2. Circuitos (entrada: dump con id, nombre, subestacion_id + JSON de SE codificado)
python3 scripts/generar_codigos_circuitos.py \
    --input /tmp/circuitos_supabase_full.json \
    --se /tmp/subestaciones_codificadas.json \
    --salida /tmp/circuitos_codificados.json \
    --sql-dir /tmp/opencode
```

Cada script valida unicidad, imprime una muestra y escribe:
- El JSON con `_nuevo` (código) y `_nombre_norm` (nombre normalizado).
- Bloques SQL de `UPDATE` (`update_subestaciones_N.sql` /
  `update_circuitos_N.sql`, 100 sentencias por archivo) listos para aplicar
  en Supabase o Postgres local.

## Determinismo

La resolución de colisiones procesa por `id` ascendente, por lo que re-ejecutar
sobre los mismos datos produce exactamente los mismos códigos.

## Reglas de normalización (resumen)

- Mayúsculas sin acentos (normalización Unicode NFD).
- Subestaciones: se eliminan prefijos `S/E`, `SE`, `SUBESTACION`, sufijos de
  voltaje (`115 KV`, `34,5 KV`, `115/34,5/13,8 KV`, `2,4` → `2.4`) y
  `PROVISIONAL`.
- Circuitos: se elimina el sufijo `-ESTADO`, las cadenas de voltaje
  (`13,8 KV`, `13.8 kV`, `34.5 /24 KV`, `K V`/`K` suelto, `115` desnudo) y se
  normalizan los designadores `(D-105)`, `(D405)`, `D105` → `D-105`.
- Numerales romanos conservados (`VALERA I`, `TRONCONAL V`).
- Colisiones tras normalizar → sufijo determinista `-2`, `-3`... por `id`.
