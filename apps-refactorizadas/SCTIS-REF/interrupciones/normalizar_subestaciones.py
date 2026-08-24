#!/usr/bin/env python3
"""
Normaliza nombres de subestaciones en common.assets.
Genera asset_name_normalizado aplicando reglas de limpieza.
"""

import re
import sys


def int_to_roman(num):
    """Convierte entero (1-3999) a número romano."""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
    roman = ''
    for i in range(len(val)):
        while num >= val[i]:
            roman += syms[i]
            num -= val[i]
    return roman


def normalizar_nombre_asset(nombre):
    if not nombre:
        return nombre
    n = nombre.strip()

    # 1. Remover voltajes con "Kv": "115 Kv", "34.5Kv", etc.
    n = re.sub(r'\s*\d+[\.,]?\d*(?:/[\d]+[\.,]?\d*)*\s*[Kk][Vv]\.?', '', n)

    # 2. Remover voltajes con slashes SIN "Kv": "115/34.5/13.8", "34,5/13,8"
    n = re.sub(r'\s*\d+[\.,]?\d*(?:/[\d]+[\.,]?\d*)+\s*', ' ', n)

    # 3. Remover voltajes decimales sueltos: "2,4", "34.5" (tienen coma o punto decimal)
    n = re.sub(r'\s+\d+[\.,]\d+\s*$', '', n)

    # 3b. "Km XX" → preservar temporalmente con marcador
    n = re.sub(r'(Km\s+\d+)', r'##\1##', n, flags=re.IGNORECASE)

    # 3c. Remover números enteros grandes sueltos al final (≥10): 115, 230, 34, 13, etc.
    n = re.sub(r'\s+(\d{2,})\s*$', '', n)

    # 3d. Restaurar "Km XX"
    n = re.sub(r'##(Km\s+\d+)##', r'\1', n)

    # 4. Remover paréntesis y contenido
    n = re.sub(r'\s*\(.*?\)', '', n)

    # 5. Remover "Provisional"
    n = re.sub(r'\s+Provisional\b', '', n, flags=re.IGNORECASE)

    # 6. Guión antes de romano: "San Fernando-Ii" → "San Fernando Ii"
    n = re.sub(r'-\s*(I{1,3}|IV|V|VI{0,3}|IX|X)\s*$', r' \1', n, flags=re.IGNORECASE)

    # 7. Romanos minúsculas → mayúsculas (al final del nombre)
    n = re.sub(r'\s+Ii\s*$', ' II', n)
    n = re.sub(r'\s+Iii\s*$', ' III', n)
    n = re.sub(r'\s+Iv\s*$', ' IV', n)

    # 8. L/Ll al final → I/II/III/IV
    n = re.sub(r'\s+Lv\s*$', ' IV', n)
    n = re.sub(r'\s+Ll\s*$', ' II', n)
    n = re.sub(r'\s+Lll\s*$', ' III', n)
    n = re.sub(r'\s+L\s*$', ' I', n)

    # 9. "Km XX" → mantener tal cual (no convertir a Romanos)
    # 10. Números enteros al final → Romanos
    if re.search(r'Km\s+\d+\s*$', n, re.IGNORECASE):
        pass  # Mantener "Km 25" como está
    else:
        n = re.sub(r'\s+(\d+)\s*$', lambda m: ' ' + int_to_roman(int(m.group(1))), n)

    # 11. Colapsar espacios múltiples
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
            WHERE asset_type = 'SUBSTATION' AND is_active = true
            ORDER BY state_code, asset_name
        """)
        rows = cur.fetchall()
        cambios = 0
        for asset_id, nombre in rows:
            normalizado = normalizar_nombre_asset(nombre)
            if normalizado != nombre:
                cambios += 1
                cur.execute(
                    "UPDATE common.assets SET asset_name_normalizado = %s WHERE asset_id = %s",
                    (normalizado, asset_id)
                )
        conn.commit()
        print(f"  {len(rows)} SE procesadas, {cambios} normalizadas")
        conn.close()
    print("\nListo.")
