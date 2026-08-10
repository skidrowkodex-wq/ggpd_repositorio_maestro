#!/usr/bin/env python3
"""Genera codigos RDS-PS (IEC 81346-10) para el catalogo de subestaciones.

Formato aprobado (formato B):  =VE+<REGION>-<NOMBRE_NORMALIZADO>

Uso:
    python3 scripts/generar_codigos_subestaciones.py \
        --input /tmp/subestaciones_supabase_full.json \
        --salida /tmp/subestaciones_codificadas.json \
        --sql-dir /tmp/opencode \
        --tabla maestro.subestaciones \
        --columna codigo

El JSON de entrada debe ser un arreglo de objetos con al menos las claves
'id', 'nombre' y 'region_id'. Cada fila de salida recibe '_nuevo' (codigo
RDS-PS) y '_nombre_norm' (nombre normalizado). Ademas se generan archivos
SQL de UPDATE en bloques de 100 sentencias.
"""
import argparse
import json

import rds_ps


def main():
    parser = argparse.ArgumentParser(
        description='Genera codigos RDS-PS para subestaciones.')
    parser.add_argument('--input', default='/tmp/subestaciones_supabase_full.json')
    parser.add_argument('--salida', default='/tmp/subestaciones_codificadas.json')
    parser.add_argument('--sql-dir', default='/tmp/opencode',
                        help='Directorio de salida para los bloques SQL.')
    parser.add_argument('--tabla', default='maestro.subestaciones')
    parser.add_argument('--columna', default='codigo')
    args = parser.parse_args()

    arr = json.load(open(args.input))
    for r in arr:
        r['_nombre_norm'] = rds_ps.normalizar_subestacion(r['nombre'])
    rds_ps.resolver_colisiones(
        arr, lambda r: rds_ps.formato_subestacion(r['region_id'], r['_nombre_norm']))

    unicos = len({r['_nuevo'] for r in arr})
    longitud_max = max(len(r['_nuevo']) for r in arr)
    print(f"== {unicos} codigos unicos para {len(arr)} subestaciones ==")
    print(f"== longitud maxima: {longitud_max} ==")
    print("\n--- MUESTRA ---")
    for r in arr[:20]:
        print(f"  {r['_nuevo']:<45} <- [{r['nombre']}]")
    if r['_nuevo'] and not all(r['_nuevo'] for r in arr):
        print("ADVERTENCIA: hay filas sin codigo asignado.")

    json.dump(arr, open(args.salida, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(f"\nJSON de salida: {args.salida}")
    print("Bloques SQL:")
    rds_ps.escribir_update_sql(arr, args.tabla, args.columna, args.sql_dir,
                               'update_subestaciones')


if __name__ == '__main__':
    main()
