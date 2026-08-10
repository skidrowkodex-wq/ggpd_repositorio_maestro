"""Primitivas SVG reutilizables para los diagramas SCTIS."""

FONT = "Segoe UI, Arial, sans-serif"

PALETA = {
    "operador":   "#e3f2fd",
    "admin":      "#e8f5e9",
    "supervisor": "#e8f5e9",
    "frontend":   "#fff3e0",
    "api":        "#ede7f6",
    "ia":         "#fce4ec",
    "bd":         "#e0f2f1",
    "fs":         "#eceff1",
    "sistema":    "#f5f5f5",
}

BORDES = {
    "operador":   "#1e88e5",
    "admin":      "#43a047",
    "supervisor": "#66bb6a",
    "frontend":   "#fb8c00",
    "api":        "#5e35b1",
    "ia":         "#d81b60",
    "bd":         "#00897b",
    "fs":         "#78909c",
    "sistema":    "#9e9e9e",
}


def esc(s):
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def wrap(s, size, maxw):
    """Divide s en lineas que quepan en maxw px aprox."""
    if not s:
        return [""]
    charw = size * 0.62
    maxchars = max(int(maxw / charw), 1)
    words = s.split(" ")
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if len(trial) <= maxchars or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def text(x, y, s, size=12, anchor="middle", weight="normal", fill="#1e293b",
         maxw=None, italic=False, spacing=1.0):
    """SVG <text> con opciones. Devuelve string. Centrado en (x,y) salvo anchor."""
    style = f"font-family:{FONT};font-size:{size}px;font-weight:{weight};fill:{fill};"
    if italic:
        style += "font-style:italic;"
    lines = wrap(s, size, maxw) if maxw else [s]
    n = len(lines)
    start_y = y - (n - 1) * size * spacing * 0.5
    parts = []
    for i, ln in enumerate(lines):
        dy = start_y + i * size * spacing
        parts.append(
            f'<text x="{x}" y="{dy}" text-anchor="{anchor}" style="{style}">{esc(ln)}</text>'
        )
    return "\n".join(parts)


def rect(x, y, w, h, rx=6, fill="#ffffff", stroke="#64748b", sw=1.2, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')


def line(x1, y1, x2, y2, stroke="#64748b", sw=1.2, dash=None, marker=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    m = f' marker-end="url(#{marker})"' if marker else ""
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}{m}/>')


def arrow_defs(arrow_id, dashed=False):
    """Marcadores de flecha. arrow_id: 'flecha' (solida) o 'retorno' (dash)."""
    fill = "#475569"
    if dashed:
        return (
            f'<marker id="{arrow_id}" viewBox="0 0 10 10" refX="9" refY="5" '
            f'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            f'<path d="M 0 1 L 9 5 L 0 9 z" fill="none" stroke="{fill}" '
            f'stroke-width="1.1"/></marker>'
        )
    return (
        f'<marker id="{arrow_id}" viewBox="0 0 10 10" refX="9" refY="5" '
        f'markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
        f'<path d="M 0 1 L 9 5 L 0 9 z" fill="{fill}"/></marker>'
    )


def svg_doc(w, h, body, title="SCTIS"):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}" font-family="{FONT}">'
        f'<defs>{arrow_defs("flecha")}{arrow_defs("retorno", dashed=True)}</defs>'
        f'<rect x="0" y="0" width="{w}" height="{h}" fill="#ffffff"/>'
        f'{body}</svg>'
    )
