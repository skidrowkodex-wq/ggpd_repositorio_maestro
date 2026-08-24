"""Diagrama de Casos de Uso de la aplicación SCTIS (SVG)."""

import math
from svg_base import esc, wrap, text, rect, line, svg_doc, PALETA, BORDES

TITULO = "Diagrama de Casos de Uso — Aplicación SCTIS"
SUB = "Sistema de Gestión de Tiras de Interrupción Eléctrica v1.0"

# Cajas de texto por caso de uso
UC = {
    1: "Autenticarse en el sistema",
    2: "Importar tiras Excel (wizard 3 pasos)",
    3: "Consultar registros de interrupción",
    4: "Visualizar dashboard (4 perspectivas)",
    5: "Descargar gráficos como PNG",
    6: "Homologar causas de interrupción",
    7: "Resolver activos inconsistentes",
    8: "Mapear a activo existente (alias)",
    9: "Reportar activo como nuevo",
    10: "Gestionar usuarios",
    11: "Revisar auditoría de cargas",
    12: "Descargar Excel de corrección",
    13: "Gestionar tareas pendientes",
    14: "Supervisar bandeja de activos",
    15: "Aprobar activo (crear + backfill)",
    16: "Asignar alias a activo existente",
    17: "Corregir nombre propuesto",
    18: "Rechazar solicitud",
    19: "Gestionar catálogo de formatos",
}

# Posiciones (cx, cy) por caso de uso
POS = {
    1: (540, 170), 2: (540, 285), 3: (540, 400), 4: (540, 515), 5: (540, 630),
    6: (540, 745), 7: (540, 860),
    8: (860, 700), 9: (860, 805),
    10: (860, 910), 11: (860, 1015), 12: (860, 1120), 13: (860, 1225),
    14: (860, 1330), 15: (860, 1435), 16: (860, 1540), 17: (860, 1645),
    18: (860, 1750), 19: (860, 1855),
}

ACTORES = {
    "operador":   (110, 360, "Operador\n(Estado)"),
    "admin":      (110, 1100, "Administrador"),
    "supervisor": (110, 1450, "Supervisor"),
    "ia":         (1195, 745, "IA Google\nGemini"),
}

# Asociaciones actor -> casos de uso
ASOC = {
    "operador":   [1, 2, 3, 4, 6, 7],
    "admin":      [1, 10, 11, 12, 13, 14, 19],
    "supervisor": [13, 14],
    "ia":         [6],
}

# include (base, hijo)
INCLUDE = [(2, 6), (2, 7), (7, 8), (14, 15), (14, 16), (14, 17), (14, 18)]
# extend (hijo, base)
EXTEND = [(9, 7), (12, 11)]
# relaciones especiales (origen, destino, etiqueta)
ESPECIAL = [(9, 14, "genera solicitud")]


def _ellipse(cx, cy, rx, ry):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" ' \
           f'fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>'


def _edge(cx, cy, tx, ty, rx, ry):
    ang = math.atan2(ty - cy, tx - cx)
    return cx + rx * math.cos(ang), cy + ry * math.sin(ang)


def _actor(x, y, etiqueta):
    """Figura de palo + etiqueta."""
    r = 11
    head = (x, y - 34)
    parts = [
        f'<circle cx="{head[0]}" cy="{head[1]}" r="{r}" fill="none" '
        f'stroke="#334155" stroke-width="1.6"/>',
        line(x, y - 23, x, y + 2, stroke="#334155", sw=1.6),
        line(x - 14, y - 14, x + 14, y - 14, stroke="#334155", sw=1.6),
        line(x, y + 2, x - 13, y + 18, stroke="#334155", sw=1.6),
        line(x, y + 2, x + 13, y + 18, stroke="#334155", sw=1.6),
    ]
    lbl = text(x, y + 34, etiqueta, size=11, weight="700", fill="#0f172a", maxw=110)
    return "\n".join(parts) + "\n" + lbl


def render():
    bnd_x0, bnd_y0, bnd_x1, bnd_y1 = 250, 95, 1110, 1935
    total_w, total_h = 1260, 1990

    b = []
    b.append(text(30, 40, TITULO, size=20, anchor="start", weight="800", fill="#0f172a"))
    b.append(text(30, 64, SUB, size=12.5, anchor="start", fill="#64748b"))

    # borde del sistema
    b.append(rect(bnd_x0, bnd_y0, bnd_x1 - bnd_x0, bnd_y1 - bnd_y0, rx=14,
                  fill="#f8fafc", stroke="#475569", sw=1.6))
    b.append(text((bnd_x0 + bnd_x1) / 2, bnd_y0 + 22,
                  "SCTIS — Sistema de Gestión de Tiras de Interrupción",
                  size=13, weight="700", fill="#1e293b"))

    # divisores de zona
    zx = (bnd_x0 + bnd_x1) / 2
    b.append(line(zx, bnd_y0 + 40, zx, bnd_y1 - 6, stroke="#94a3b8", sw=1, dash="8 5"))
    b.append(text(zx, bnd_y0 + 40, "INGESTIÓN", size=10.5, weight="700",
                  fill="#94a3b8", anchor="start"))
    b.append(text(zx + 14, bnd_y0 + 40 + 15, "GOBIERNO", size=10.5, weight="700",
                  fill="#94a3b8", anchor="start"))

    # casos de uso
    rx, ry = 92, 30
    for uid, (cx, cy) in POS.items():
        b.append(_ellipse(cx, cy, rx, ry))
        b.append(text(cx, cy, UC[uid], size=11, weight="600", fill="#1d4ed8",
                      maxw=rx * 2 - 26))

    # actores
    for key, (x, y, etiqueta) in ACTORES.items():
        b.append(_actor(x, y, etiqueta))

    # asociaciones actor-caso
    for actor, ucs in ASOC.items():
        ax, ay, _ = ACTORES[actor]
        for uid in ucs:
            cx, cy = POS[uid]
            ex, ey = _edge(ax, ay, cx, cy, 0, 0)
            ux, uy = _edge(cx, cy, ax, ay, rx, ry)
            b.append(line(ex, ey, ux, uy, stroke="#475569", sw=1.4))

    def _rel(a, bb, etiqueta, kind):
        ax, ay = POS[a]
        bx, by = POS[bb]
        ax1, ay1 = _edge(ax, ay, bx, by, rx, ry)
        bx1, by1 = _edge(bx, by, ax, ay, rx, ry)
        dash = "7 4" if kind == "include" else "3 4"
        b.append(line(ax1, ay1, bx1, by1, stroke="#0891b2", sw=1.3, dash=dash,
                      marker="flecha"))
        mx, my = (ax1 + bx1) / 2, (ay1 + by1) / 2
        lbl = "«include»" if kind == "include" else "«extend»"
        b.append(text(mx, my - 6, lbl, size=9.5, weight="700", fill="#0e7490"))

    for base, hijo in INCLUDE:
        _rel(base, hijo, "", "include")
    for hijo, base in EXTEND:
        _rel(hijo, base, "", "extend")
    for orig, dest, etiqueta in ESPECIAL:
        ox, oy = POS[orig]
        dx, dy = POS[dest]
        ox1, oy1 = _edge(ox, oy, dx, dy, rx, ry)
        dx1, dy1 = _edge(dx, dy, ox, oy, rx, ry)
        b.append(line(ox1, oy1, dx1, dy1, stroke="#9333ea", sw=1.3, dash="6 3",
                      marker="flecha"))
        mx, my = (ox1 + dx1) / 2, (oy1 + dy1) / 2
        b.append(text(mx, my - 6, etiqueta, size=10, weight="700", fill="#7e22ce"))

    # nota de roles
    b.append(text(bnd_x1 - 10, bnd_y1 + 24,
                  "El rol Supervisor comparte por ahora las funciones del Administrador.",
                  size=11, anchor="end", italic=True, fill="#64748b"))

    return svg_doc(total_w, total_h, "\n".join(b), title="SCTIS-CASOS-USO")
