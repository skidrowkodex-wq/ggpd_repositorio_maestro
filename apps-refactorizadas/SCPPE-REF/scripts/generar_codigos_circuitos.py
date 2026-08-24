#!/usr/bin/env python3
"""Genera codigos RDS-PS (IEC 81346-10) para el catalogo de circuitos.

Formato aprobado:  =VE+<REGION>-<SUBESTACION>:<CIRCUITO>

Uso:
    python3 scripts/generar_codigos_circuitos.py \
        --input /tmp/circuitos_supabase_full.json \
        --se /tmp/subestaciones_codificadas.json \
        --salida /tmp/circuitos_codificados.json \
        --sql-dir /tmp/opencode \
        --tabla maestro.circuitos \
        --columna codigo

El JSON de entrada debe ser un arreglo de objetos con al menos las claves
'id', 'nombre' y 'subestacion_id'. El JSON de subestaciones debe contener
los codigos ya asignados ('_nuevo' por SE). Cada fila de salida recibe
'_nuevo' (codigo RDS-PS) y '_nombre_norm'. Ademas se generan archivos SQL
de UPDATE en bloques de 100 sentencias.
"""
import argparse
import json

import rds_ps


def main():
    parser = argparse.ArgumentParser(
        description='Genera codigos RDS-PS para circuitos.')
    parser.add_argument('--input', default='/tmp/circuitos_supabase_full.json')
    parser.add_argument('--se', default='/tmp/subestaciones_codificadas.json',
                        help='JSON con subestaciones ya codificadas.')
    parser.add_argument('--salida', default='/tmp/circuitos_codificados.json')
    parser.add_argument('--sql-dir', default='/tmp/opencode',
                        help='Directorio de salida para los bloques SQL.')
    parser.add_argument('--tabla', default='maestro.circuitos')
    parser.add_argument('--columna', default='codigo')
    args = parser.parse_args()

    arr = json.load(open(args.input))
    se = json.load(open(args.se))
    se_map = {r['id']: r for r in se}

    def base_fn(r):
        se_padre = se_map.get(r['subestacion_id'])
        return f"{se_padre['_nuevo']}:{r['_nombre_norm']}"

    for r in arr:
        r['_nombre_norm'] = rds_ps.normalizar_circuito(r['nombre'])
    rds_ps.resolver_colisiones(arr, base_fn)

    unicos = len({r['_nuevo'] for r in arr if r['_nuevo']})
    total = sum(1 for r in arr if r['_nuevo'])
    longitud_max = max(len(r['_nuevo']) for r in arr)
    colisiones = sum(1 for r in arr if r['_nuevo'] and r['_nuevo'].endswith('-2'))
    print(f"== {unicos} codigos unicos para {total} circuitos ==")
    print(f"== longitud maxima: {longitud_max}, colisiones resueltas (-2): {colisiones} ==")
    print("\n--- MUESTRA ---")
    for r in arr[:18]:
        print(f"  {r['_nuevo']}")
    if total != len(arr):
        print(f"ADVERTENCIA: {len(arr) - total} circuitos sin SE padre asignada.")

    json.dump(arr, open(args.salida, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"\nJSON de salida: {args.salida}")
    print("Bloques SQL:")
    rds_ps.escribir_update_sql(arr, args.tabla, args.columna, args.sql_dir,
                               'update_circuitos')


if __name__ == '__main__':
    main()
