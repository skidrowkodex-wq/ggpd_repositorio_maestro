"""Diagramas de secuencia (por carriles/POOL) de todos los procesos SCTIS.

Cada elemento del sistema es un carril (pool): Operador, Admin/Supervisor,
Frontend, API, IA, BD, FS. Renderiza SVG.
"""
from svg_base import esc, wrap, text, rect, line, svg_doc, PALETA, BORDES

POOL_KEYS = {
    "operador":  ("Operador\n(Estado)", "operador"),
    "admin":     ("Administrador", "admin"),
    "supervisor": ("Supervisor", "supervisor"),
    "frontend":  ("Frontend\n(Vue 3)", "frontend"),
    "api":       ("API Flask", "api"),
    "ia":        ("IA Gemini", "ia"),
    "bd":        ("BD PostgreSQL", "bd"),
    "fs":        ("Archivos\n/tmp", "fs"),
    "usuario":   ("Usuario\n(perspectiva)", "operador"),
    "sistema":   ("Sistema\n(origen)", "sistema"),
    "trg_mes":   ("Trigger\ntrg_set_mes", "bd"),
    "trg_quality": ("Trigger\ntrg_tira_quality", "bd"),
    "trg_dup":   ("Trigger\ntrg_tira_dup", "bd"),
}


def _pool_line(label):
    parts = label.split("\n")
    return (" ".join(parts), len(parts))


class Secuencia:
    def __init__(self, titulo, codigo, pools, mensajes, leyenda=None):
        self.titulo = titulo
        self.codigo = codigo
        self.pools = pools          # lista de claves de POOL_KEYS
        self.mensajes = mensajes    # items: ("call"|"return", src, dst, label) | ("gap", n) | ("nota", txt)
        self.leyenda = leyenda      # opcional (titulo_zona, items_zona)

    def render(self):
        labels = []
        for k in self.pools:
            name, nlines = _pool_line(POOL_KEYS[k][0])
            labels.append((name, nlines))

        idx = {k: i for i, k in enumerate(self.pools)}
        W = max(min(max(len(n) for n, _ in labels) * 7.4 + 30, 250), 170)
        n = len(self.pools)
        ml, mr = 22, 22
        total_w = ml + mr + n * W
        xs = [ml + W * (i + 0.5) for i in range(n)]

        head_h = max(max(nl for _, nl in labels) * 16 + 26, 52)
        title_h = 92
        y0 = title_h + head_h + 12
        cursor = y0

        rows = []  # (y, kind, src, dst, label)
        for item in self.mensajes:
            if item[0] == "gap":
                cursor += item[1] * 30
                continue
            if item[0] == "nota":
                rows.append((cursor, "nota", None, None, item[1]))
                cursor += 30
                continue
            kind, src, dst, label = item
            rows.append((cursor, kind, src, dst, label))
            cursor += 48 if (kind == "call" and src == dst) else 30

        bottom = cursor + 46

        # ---------- cuerpo ----------
        b = []
        # bandas de lifeline
        for i, k in enumerate(self.pools):
            cat = POOL_KEYS[k][1]
            x = xs[i]
            b.append(rect(x - W / 2 + 4, y0 - 6, W - 8, bottom - y0 + 18,
                          fill="#ffffff", stroke="none"))
            b.append(line(x, y0 + 2, x, bottom - 6, stroke="#94a3b8",
                          sw=1.1, dash="4 4"))

        # activaciones simples: barras en destino
        acts = {}
        for yi, kind, src, dst, label in rows:
            if kind in ("call", "return") and idx[src] != idx[dst]:
                acts.setdefault(idx[dst], []).append((yi, yi + 20))
        for i, k in enumerate(self.pools):
            for y1, y2 in acts.get(i, []):
                b.append(rect(xs[i] - 4, y1, 8, y2 - y1, rx=3,
                              fill="#c7d2fe", stroke="#6366f1", sw=1))

        # mensajes
        for yi, kind, src, dst, label in rows:
            if kind == "nota":
                xm = (xs[0] + xs[-1]) / 2
                b.append(text(xm, yi + 10, label, size=12.5, fill="#475569",
                              italic=True, maxw=total_w - 80))
                continue
            x1, x2 = xs[idx[src]], xs[idx[dst]]
            if src == dst:
                b.append(self._loop(x1, yi, label))
                continue
            if kind == "call":
                b.append(line(x1 + 4, yi, x2 - 6, yi, stroke="#475569",
                              sw=1.4, marker="flecha"))
            else:
                b.append(line(x2 - 4, yi, x1 + 6, yi, stroke="#64748b",
                              sw=1.1, dash="5 4", marker="retorno"))
            span = abs(idx[dst] - idx[src])
            xm = (x1 + x2) / 2
            mw = min(span * W + W - 34, 460)
            b.append(text(xm, yi - 6, label, size=11.5, fill="#1e293b",
                          weight="600", maxw=mw))

        # ---------- cabecera de pools ----------
        for i, k in enumerate(self.pools):
            name, _ = _pool_line(POOL_KEYS[k][0])
            cat = POOL_KEYS[k][1]
            x = xs[i]
            hh = head_h - 4
            b.append(rect(x - W / 2 + 4, y0 - head_h, W - 8, hh, rx=7,
                          fill=PALETA[cat], stroke=BORDES[cat], sw=1.4))
            b.append(text(x, y0 - head_h + hh / 2, name, size=12.5,
                          weight="700", fill="#0f172a", maxw=W - 22))

        # ---------- titulo ----------
        b.append(text(ml, 34, self.titulo, size=17, anchor="start",
                      weight="800", fill="#0f172a"))
        b.append(text(ml, 56, f"Diagrama de secuencia por carriles — {self.codigo}",
                      size=11.5, anchor="start", fill="#64748b"))
        b.append(text(total_w - mr, 34, "SCTIS v1.0", size=11.5, anchor="end",
                      fill="#94a3b8"))
        b.append(line(ml, 66, total_w - mr, 66, stroke="#cbd5e1", sw=1.2))

        # ---------- leyenda de zonas ----------
        if self.leyenda:
            zt, zitems = self.leyenda
            yy = bottom + 18
            b.append(text(ml, yy, zt, size=12.5, anchor="start", weight="700",
                          fill="#334155"))
            yy += 22
            for txt in zitems:
                b.append(text(ml, yy, f"• {txt}", size=11.5, anchor="start",
                              fill="#475569"))
                yy += 18
            bottom = yy + 10

        return svg_doc(total_w, bottom, "\n".join(b), title=self.codigo)

    def _loop(self, x, y, label):
        return (f'<path d="M {x} {y} h 34 q 9 0 9 9 v 14 q 0 9 -9 9 h -34" '
                f'fill="none" stroke="#475569" stroke-width="1.4" '
                f'marker-end="url(#flecha)"/>'
                + text(x + 30, y - 6, label, size=11.5, weight="600",
                       fill="#1e293b", maxw=150))


def guardar(nombre, secuencia):
    import os
    out = os.path.join("docs", "diagramas", nombre + ".svg")
    with open(out, "w") as f:
        f.write(secuencia.render())
    print("SVG:", out)
