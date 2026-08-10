#!/usr/bin/env python3
"""Utilidades compartidas para la codificacion RDS-PS (IEC 81346-10).

Modulo comun usado por los generadores de codigos de subestaciones y
circuitos. Toda la normalizacion esta centralizada aqui para mantener un
unico criterio y permitir re-ejecuciones deterministas.

Convencion general (formato aprobado por el usuario):
    Subestacion:   =VE+<REGION>-<SUBESTACION>        (ej. =VE+GUARICO-SAN JUAN)
    Circuito:      =VE+<REGION>-<SUBESTACION>:<CTO>  (ej. =VE+GUARICO-SAN JUAN:LOS LLANOS)
"""
import json
import re
import unicodedata
from pathlib import Path

# Nombres legibles de regiones (estado/region en espanol).
NOMBRE_REGION = {
    1: "GUARICO", 2: "LARA", 3: "ANZOATEGUI", 4: "ARAGUA", 5: "NUEVA ESPARTA",
    6: "ZULIA", 7: "PORTUGUESA", 8: "SUCRE", 9: "TRUJILLO", 10: "CARABOBO",
    11: "MERIDA", 12: "BARINAS", 13: "TACHIRA", 14: "LA GUAIRA", 15: "APURE",
    16: "DELTA AMACURO", 17: "BOLIVAR", 18: "MONAGAS", 19: "FALCON", 20: "COJEDES",
    21: "MIRANDA", 22: "YARACUY", 23: "REGION CAPITAL", 24: "AMAZONAS",
}

# Sufijos de estado que pueden aparecer al final de un nombre de circuito.
SUFIJOS_ESTADO = [
    "REGION CAPITAL", "LA GUAIRA", "NUEVA ESPARTA", "DELTA AMACURO",
    "ANZOATEGUI", "PORTUGUESA", "CARABOBO", "TACHIRA", "BOLIVAR",
    "MONAGAS", "MIRANDA", "GUARICO", "ARAGUA", "TRUJILLO", "FALCON",
    "BARINAS", "ZULIA", "MERIDA", "LARA", "SUCRE", "APURE", "COJEDES",
    "YARACUY", "AMAZONAS",
]

ROMANOS = re.compile(r'\b(?:M{0,4}D?C{0,3}L?X{0,3}V?I{0,3}|IV|IX|XL|XC|CD|CM)\b', re.I)

# Sufijos de voltaje que se eliminan de los nombres de subestaciones.
SUFIJOS_VOLTAJE_SE = re.compile(
    r'\s*\d+(?:[.,]\d+)?(?:\s*(?:/|\\|por)\s*\d+(?:[.,]\d+)?)+\s*(?:KV|kV|V)?\.?$'
    r'|\s*\d+(?:[.,]\d+)?\s*(?:KV|kV|V)\.?$'
    r'|\s*(?:KV|kV)\b\.?$'
    r'|\s*(?:34|115|138|230|400|765|13|24|4[.,]5)\s*$', re.I)

# Cadenas de voltaje que se eliminan de los nombres de circuitos.
VOLTAJE_CIRCUITO = re.compile(
    r'\s*\d+(?:[.,]\s*\d+)?(?:\s*(?:/|\\|por)\s*\d+(?:[.,]\s*\d+)?)+\s*(?:KV|kV|V|K\s*V|K)?\.?'
    r'|\s*\d+(?:[.,]\s*\d+)?\s*(?:KV|kV|V|K\s*V|K)\.?'
    r'|\s*\d+(?:[.,]\s*\d+)?\s*(?=[DB]-\d)'
    r'|\s*(?:KV|kV|K\s*V|K)\b\.?'
    r'|\s*\d+(?:[.,]\s*\d+)\s*$', re.I)

DESIGNADOR = re.compile(r'\(?([DB])\s*-?\s*(\d+)\)?')


def quitar_acentos(s):
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if not unicodedata.combining(c))


def normalizar_subestacion(nombre):
    """Normaliza el nombre de una subestacion (formato -<NOMBRE>)."""
    s = quitar_acentos(nombre.upper())
    s = re.sub(r'^(S/E|SE|SUBESTACION)\s*', '', s.strip())
    s = re.sub(r'\s+PROVISIONAL\s*$', '', s)
    s = SUFIJOS_VOLTAJE_SE.sub('', s)
    s = s.replace('S/E ', ' ').replace('S/E', ' ')
    s = re.sub(r'(\d),(\d)', r'\1.\2', s)
    s = re.sub(r'[^A-Z0-9.\s]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def normalizar_circuito(nombre):
    """Normaliza el nombre de un circuito (aspecto ':<CIRCUITO>')."""
    s = quitar_acentos(nombre.upper())
    for estado in SUFIJOS_ESTADO:
        s = re.sub(r'\s*-\s*' + re.escape(estado) + r'\s*$', '', s)
    s = DESIGNADOR.sub(r'\1-\2', s)
    s = VOLTAJE_CIRCUITO.sub(' ', s)
    s = re.sub(r'(\d),(\d)', r'\1.\2', s)
    s = re.sub(r'[^A-Z0-9. -]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def formato_subestacion(region_id, nombre):
    reg = NOMBRE_REGION.get(region_id, 'XX')
    return f"=VE+{reg}-{nombre}"


def resolver_colisiones(filas, base_fn):
    """Resuelve colisiones con sufijos -2, -3... de forma determinista.

    Las filas se procesan en orden ascendente de 'id', de modo que el
    resultado es estable ante re-ejecuciones. Devuelve el mismo iterable
    con la clave '_nuevo' asignada en cada fila.
    """
    usados = {}
    for fila in sorted(filas, key=lambda x: x['id']):
        base = base_fn(fila)
        if base in usados:
            n = 2
            while f"{base}-{n}" in usados:
                n += 1
            fila['_nuevo'] = f"{base}-{n}"
        else:
            fila['_nuevo'] = base
        usados[fila['_nuevo']] = fila['id']
    return filas


def escribir_update_sql(filas, tabla, columna, outdir, nombre_base, tamano_bloque=100):
    """Genera archivos SQL con UPDATEs por fila, en bloques de N sentencias.

    Ejemplo: UPDATE maestro.circuitos SET codigo='...' WHERE id=123;
    """
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    ordenadas = sorted(filas, key=lambda x: x['id'])
    total = len(ordenadas)
    for i in range(0, total, tamano_bloque):
        bloque = ordenadas[i:i + tamano_bloque]
        num = i // tamano_bloque
        ruta = outdir / f"{nombre_base}_{num}.sql"
        with open(ruta, 'w', encoding='utf-8') as f:
            for fila in bloque:
                codigo = fila['_nuevo'].replace("'", "''")
                f.write(
                    f"UPDATE {tabla} SET {columna}='{codigo}' "
                    f"WHERE id={fila['id']};\n"
                )
        print(f"  {ruta}  ({len(bloque)} filas)")
    return total
