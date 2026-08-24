#!/usr/bin/env python3
"""
Normaliza nombres de circuitos en common.assets.
Extrae tipo de elemento (CTO, D, S, B, etc.) y genera asset_name_normalizado.
"""

import re
import sys


def int_to_roman(num):
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    roman = ''
    for i in range(len(val)):
        while num >= val[i]:
            roman += syms[i]
            num -= val[i]
    return roman


MAPA_ELEMENTOS = {
    'D': 'Disyuntor',
    'S': 'Seccionador',
    'B': 'Barra',
    'E': 'Enchufe',
    'T': 'Transformador',
    'TC': 'Transformador de Corriente',
    'TP': 'Transformador de Potencial',
    'P': 'Pararrayos',
    'C': 'Condensador',
    'R': 'Reactor',
    'L': 'Linea',
}


def extraer_elemento(nombre):
    """
    Extrae tipo y código del elemento desde paréntesis.
    Retorna (tipo, codigo, pos_inicio, pos_fin) o None.
    """
    if not nombre:
        return None

    m = re.search(r'\(([A-Za-z]+-?\d+[A-Za-z]?)\)\s*$', nombre)
    if m:
        cod = m.group(1)
        prefijo = re.match(r'^([A-Za-z]+)', cod).group(1).upper()
        tipo = prefijo if prefijo in MAPA_ELEMENTOS else 'Otro'
        return (tipo, cod, m.start(), m.end())

    m = re.search(r'\(([A-Za-z]+)\)\s*$', nombre)
    if m:
        cod = m.group(1)
        upper = cod.upper()
        if upper in ('COL', 'COLU', 'COLM'):
            return ('COL', cod, m.start(), m.end())
        if upper in ('RESPALDO',):
            return ('RESPALDO', cod, m.start(), m.end())
        if upper in ('Q',):
            return ('Q', cod, m.start(), m.end())
        if upper in ('RESERVA',):
            return ('RESERVA', cod, m.start(), m.end())
        prefijo = upper
        if prefijo in MAPA_ELEMENTOS:
            return (prefijo, cod, m.start(), m.end())
        return ('OTRO_TEXTO', cod, m.start(), m.end())

    m = re.search(r'\((\d[\d,.\s]*Kv?\b[^)]*)\)\s*$', nombre, re.IGNORECASE)
    if m:
        return ('VOLTAJE', m.group(1), m.start(), m.end())

    return None


def normalizar_nombre_circuito(nombre, elemento_info):
    if not nombre:
        return nombre
    n = nombre.strip()

    if elemento_info:
        tipo, cod, pos_ini, pos_fin = elemento_info
        n = n[:pos_ini].strip()

    # Remover voltaje residual entre paréntesis al inicio: "( 35)", "(34,5)", etc.
    n = re.sub(r'^\(\s*[\d,.\s]+\)\s*', '', n)

    n = re.sub(r'\s*\d+[\.,]?\d*(?:/[\d]+[\.,]?\d*)*\s*[Kk][Vv]\.?', '', n)
    n = re.sub(r'\s*\d+[\.,]?\d*(?:/[\d]+[\.,]?\d*)+\s*', ' ', n)
    n = re.sub(r'\s+\d+[\.,]\d+\s*$', '', n)
    n = re.sub(r'\s+(\d{2,})\s*$', '', n)

    n = re.sub(r'\s*[Pp]rovisional\b', '', n)
    n = re.sub(r'\s*-\s*$', '', n)
    n = re.sub(r'\s+', ' ', n).strip()

    n = re.sub(r'-\s*(I{1,3}|IV|V|VI{0,3}|IX|X)\s*$', r' \1', n, flags=re.IGNORECASE)
    n = re.sub(r'\s+Ii\s*$', ' II', n)
    n = re.sub(r'\s+Iii\s*$', ' III', n)
    n = re.sub(r'\s+Iv\s*$', ' IV', n)
    n = re.sub(r'\s+Lv\s*$', ' IV', n)
    n = re.sub(r'\s+Ll\s*$', ' II', n)
    n = re.sub(r'\s+Lll\s*$', ' III', n)
    n = re.sub(r'\s+L\s*$', ' I', n)

    if re.search(r'Km\s+\d+\s*$', n, re.IGNORECASE):
        pass
    else:
        n = re.sub(r'\s+(\d+)\s*$', lambda m: ' ' + int_to_roman(int(m.group(1))), n)

    n = re.sub(r'\s{2,}', ' ', n).strip()
    return n


if __name__ == '__main__':
    import psycopg2

    hosts = [
        ('192.168.100.142', 'Remoto'),
        ('localhost', 'Local'),
    ]

    for host, label in hosts:
        print(f"\n{'='*50}")
        print(f"  Procesando: {label} ({host})")
        print(f"{'='*50}")
        conn = psycopg2.connect(
            host=host, dbname='ggpd_se_cto_v1',
            user='fullstack001', password='Lunes35.'
        )
        cur = conn.cursor()
        cur.execute("""
            SELECT asset_id, asset_name FROM common.assets
            WHERE asset_type = 'CIRCUITO' AND is_active = true
            ORDER BY state_code, asset_name
        """)
        rows = cur.fetchall()
        cambios = 0
        stats = {}
        for asset_id, nombre in rows:
            elem = extraer_elemento(nombre)
            tipo = elem[0] if elem else 'CTO'
            cod = elem[1] if elem else None
            normalizado = normalizar_nombre_circuito(nombre, elem)

            stats[tipo] = stats.get(tipo, 0) + 1

            if normalizado != nombre or tipo != 'CTO':
                cambios += 1
                cur.execute("""
                    UPDATE common.assets 
                    SET asset_name_normalizado = %s, 
                        elemento_tipo = %s,
                        elemento_codigo = %s
                    WHERE asset_id = %s
                """, (normalizado, tipo, cod, asset_id))

        conn.commit()
        print(f"  {len(rows)} circuitos procesados, {cambios} actualizados")
        print(f"  Distribución por tipo de elemento:")
        for tipo, cnt in sorted(stats.items(), key=lambda x: -x[1]):
            print(f"    {tipo}: {cnt}")
        conn.close()
    print("\nListo.")
